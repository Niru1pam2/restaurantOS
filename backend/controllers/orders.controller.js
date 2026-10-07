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
  });
  const menuMap = new Map(dbMenuItems.map((m) => [m.id, m]));

  let subtotal = 0;
  const orderItemsData = items.map((item) => {
    const menu = menuMap.get(Number(item.menuItemId));
    if (!menu) throw new Error(`Menu item ID ${item.menuItemId} not found`);
    const qty = Number(item.quantity || 1);
    const itemPrice = menu.price * qty;
    subtotal += itemPrice;

    return {
      menuItemId: menu.id,
      quantity: qty,
      price: menu.price,
      notes: item.notes || null,
    };
  });

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
      items: { include: { menuItem: true } },
    },
  });

  if (tableId) {
    await prisma.table.update({
      where: { id: Number(tableId) },
      data: { status: "OCCUPIED" },
    });
  }

  res.status(201).json({ success: true, data: order });
});

export const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const existingOrder = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!existingOrder) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status },
    include: { table: true, items: { include: { menuItem: true } } },
  });

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
