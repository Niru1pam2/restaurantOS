import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getTables = catchAsync(async (req, res) => {
  const tables = await prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
    include: {
      orders: {
        where: { status: { in: ["PENDING", "PREPARING", "READY", "SERVED"] } },
        select: { id: true, orderNumber: true, totalAmount: true, status: true },
      },
    },
  });
  res.json({ success: true, data: tables });
});

export const createTable = catchAsync(async (req, res) => {
  const { tableNumber, capacity, location } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ success: false, message: "Table number is required" });
  }

  const table = await prisma.table.create({
    data: {
      tableNumber,
      capacity: Number(capacity) || 4,
      location: location || "Main Dining",
    },
  });
  res.status(201).json({ success: true, data: table });
});

export const updateTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, capacity, status, location } = req.body;

  const table = await prisma.table.update({
    where: { id: Number(id) },
    data: {
      ...(tableNumber && { tableNumber }),
      ...(capacity !== undefined && { capacity: Number(capacity) }),
      ...(status && { status }),
      ...(location !== undefined && { location }),
    },
  });
  res.json({ success: true, data: table });
});

export const deleteTable = catchAsync(async (req, res) => {
  await prisma.table.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Table deleted successfully" });
});
