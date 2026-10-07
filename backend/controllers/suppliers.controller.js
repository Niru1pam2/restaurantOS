import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getSuppliers = catchAsync(async (req, res) => {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { ingredients: true, purchaseOrders: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: suppliers });
});

export const createSupplier = catchAsync(async (req, res) => {
  const { name, contactPerson, email, phone, address } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Supplier name is required" });
  }

  const supplier = await prisma.supplier.create({
    data: { name, contactPerson, email, phone, address },
  });
  res.status(201).json({ success: true, data: supplier });
});

export const updateSupplier = catchAsync(async (req, res) => {
  const { name, contactPerson, email, phone, address } = req.body;

  const supplier = await prisma.supplier.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name && { name }),
      ...(contactPerson !== undefined && { contactPerson }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
    },
  });
  res.json({ success: true, data: supplier });
});

export const deleteSupplier = catchAsync(async (req, res) => {
  await prisma.supplier.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Supplier deleted successfully" });
});
