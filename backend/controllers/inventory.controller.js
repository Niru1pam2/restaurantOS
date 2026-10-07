import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

// ------------ Stock Transactions (In / Out / Adjustment / Waste) ------------
export const getStockTransactions = catchAsync(async (req, res) => {
  const transactions = await prisma.stockTransaction.findMany({
    include: {
      ingredient: true,
      user: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: transactions });
});

export const createStockTransaction = catchAsync(async (req, res) => {
  const { type, quantity, reason, ingredientId } = req.body;
  if (!type || !quantity || !ingredientId) {
    return res.status(400).json({
      success: false,
      message: "type, quantity, and ingredientId are required",
    });
  }

  const qty = Number(quantity);
  const ing = await prisma.ingredient.findUnique({ where: { id: Number(ingredientId) } });
  if (!ing) return res.status(404).json({ success: false, message: "Ingredient not found" });

  let newStock = ing.currentStock;
  if (type === "IN") newStock += qty;
  else if (type === "OUT" || type === "WASTE") newStock -= qty;
  else if (type === "ADJUSTMENT") newStock = qty;

  await prisma.ingredient.update({
    where: { id: Number(ingredientId) },
    data: { currentStock: Math.max(0, newStock) },
  });

  const transaction = await prisma.stockTransaction.create({
    data: {
      type,
      quantity: qty,
      reason,
      ingredientId: Number(ingredientId),
      userId: req.user.id,
    },
    include: { ingredient: true, user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: transaction });
});

// ------------ Purchase Orders ------------
export const getPurchaseOrders = catchAsync(async (req, res) => {
  const orders = await prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: { include: { ingredient: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: orders });
});

export const createPurchaseOrder = catchAsync(async (req, res) => {
  const { supplierId, expectedDate, notes, items } = req.body;
  if (!supplierId || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: "supplierId and items are required" });
  }

  let totalAmount = 0;
  const poItemsData = items.map((item) => {
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);
    const itemTotal = qty * price;
    totalAmount += itemTotal;
    return {
      ingredientId: Number(item.ingredientId),
      quantity: qty,
      unitPrice: price,
      totalPrice: itemTotal,
    };
  });

  const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
  const po = await prisma.purchaseOrder.create({
    data: {
      orderNumber,
      supplierId: Number(supplierId),
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      notes,
      totalAmount,
      items: { create: poItemsData },
    },
    include: { supplier: true, items: { include: { ingredient: true } } },
  });

  res.status(201).json({ success: true, data: po });
});

export const updatePurchaseOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const po = await prisma.purchaseOrder.update({
    where: { id: Number(id) },
    data: { status },
    include: { items: true },
  });

  if (status === "RECEIVED") {
    for (const item of po.items) {
      await prisma.ingredient.update({
        where: { id: item.ingredientId },
        data: { currentStock: { increment: item.quantity } },
      });

      await prisma.stockTransaction.create({
        data: {
          type: "IN",
          quantity: item.quantity,
          reason: `Purchase Order ${po.orderNumber} Received`,
          ingredientId: item.ingredientId,
          userId: req.user.id,
        },
      });
    }
  }

  res.json({ success: true, data: po });
});