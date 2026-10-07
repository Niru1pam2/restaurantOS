import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getOrders = catchAsync(async (req, res) => {
  const { status, tableId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (tableId) where.tableId = Number(tableId);

  const orders = await prisma.order.findMany({
    where,
    include: {
      table: true,
      waiter: { select: { id: true, name: true, role: true } },
      items: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: orders });
});

export const createOrder = catchAsync(async (req, res) => {
  const { tableId, items, notes } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Order must contain at least one item" });
  }

  const menuItemIds = items.map((i) => Number(i.menuItemId));
  const dbMenuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: { recipeItems: { include: { ingredient: true } } },
  });
  const menuMap = new Map(dbMenuItems.map((m) => [m.id, m]));

  // Check ingredient stock before placing order
  const requiredIngredients = new Map(); // ingredientId -> { ingredient, totalNeeded }

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const menu = menuMap.get(Number(item.menuItemId));
    if (!menu) {
      return res.status(404).json({ success: false, message: `Menu item ID ${item.menuItemId} not found` });
    }
    const qty = Number(item.quantity || 1);
    const itemPrice = menu.price * qty;
    subtotal += itemPrice;

    orderItemsData.push({
      menuItemId: menu.id,
      quantity: qty,
      price: menu.price,
      notes: item.notes || null,
    });

    for (const rItem of menu.recipeItems || []) {
      const needed = Number(rItem.quantityRequired) * qty;
      const ingId = rItem.ingredientId;
      if (requiredIngredients.has(ingId)) {
        requiredIngredients.get(ingId).totalNeeded += needed;
      } else {
        requiredIngredients.set(ingId, {
          ingredient: rItem.ingredient,
          totalNeeded: needed,
        });
      }
    }
  }

  // Validate sufficient stock for all required ingredients
  const insufficientList = [];
  for (const [ingId, { ingredient, totalNeeded }] of requiredIngredients) {
    if (ingredient.currentStock < totalNeeded) {
      insufficientList.push(
        `${ingredient.name} (Required: ${totalNeeded} ${ingredient.unit}, Available: ${ingredient.currentStock} ${ingredient.unit})`
      );
    }
  }

  if (insufficientList.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for order: ${insufficientList.join("; ")}`,
    });
  }

  const tax = Number((subtotal * 0.05).toFixed(2));
  const totalAmount = Number((subtotal + tax).toFixed(2));
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      tableId: tableId ? Number(tableId) : null,
      waiterId: req.user.id,
      subtotal,
      tax,
      totalAmount,
      notes,
      items: { create: orderItemsData },
    },
    include: {
      table: true,
      items: { include: { menuItem: { include: { recipeItems: true } } } },
    },
  });

  if (tableId) {
    await prisma.table.update({
      where: { id: Number(tableId) },
      data: { status: "OCCUPIED" },
    });
  }

  // Deduct ingredient stock & record stock transactions for each item's recipe
  for (const item of order.items) {
    const recipeItems = item.menuItem?.recipeItems || [];
    for (const rItem of recipeItems) {
      const neededQty = Number(rItem.quantityRequired) * item.quantity;
      if (neededQty > 0) {
        await prisma.ingredient.update({
          where: { id: rItem.ingredientId },
          data: { currentStock: { decrement: neededQty } },
        });

        await prisma.stockTransaction.create({
          data: {
            type: "OUT",
            quantity: neededQty,
            reason: `Order ${order.orderNumber} - ${item.menuItem.name} x${item.quantity}`,
            ingredientId: rItem.ingredientId,
            userId: req.user?.id || null,
          },
        });
      }
    }
  }

  res.status(201).json({ success: true, data: order });
});

export const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const existingOrder = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { menuItem: { include: { recipeItems: true } } } } },
  });

  if (!existingOrder) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status },
    include: { table: true, items: { include: { menuItem: true } } },
  });

  // Restore ingredient stock if order is cancelled and wasn't already cancelled
  if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
    for (const item of existingOrder.items) {
      const recipeItems = item.menuItem?.recipeItems || [];
      for (const rItem of recipeItems) {
        const restoredQty = Number(rItem.quantityRequired) * item.quantity;
        if (restoredQty > 0) {
          await prisma.ingredient.update({
            where: { id: rItem.ingredientId },
            data: { currentStock: { increment: restoredQty } },
          });

          await prisma.stockTransaction.create({
            data: {
              type: "IN",
              quantity: restoredQty,
              reason: `Cancelled Order ${existingOrder.orderNumber} - ${item.menuItem.name} x${item.quantity}`,
              ingredientId: rItem.ingredientId,
              userId: req.user?.id || null,
            },
          });
        }
      }
    }
  }

  if ((status === "COMPLETED" || status === "CANCELLED") && order.tableId) {
    const activeOrdersCount = await prisma.order.count({
      where: {
        tableId: order.tableId,
        status: { in: ["PENDING", "PREPARING", "READY", "SERVED"] },
        id: { not: order.id },
      },
    });

    if (activeOrdersCount === 0) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: status === "COMPLETED" ? "CLEANING" : "AVAILABLE" },
      });
    }
  }

  res.json({ success: true, data: order });
});

export const completePayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, discount } = req.body;

  const existingOrder = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!existingOrder) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const disc = Number(discount || 0);
  const updatedTotal = Math.max(0, existingOrder.totalAmount - disc);

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      paymentStatus: "PAID",
      paymentMethod: paymentMethod || "CASH",
      status: "COMPLETED",
      discount: disc,
      totalAmount: updatedTotal,
    },
    include: { table: true },
  });

  if (order.tableId) {
    await prisma.table.update({
      where: { id: order.tableId },
      data: { status: "AVAILABLE" },
    });
  }

  res.json({ success: true, data: order });
});
