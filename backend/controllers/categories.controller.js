import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getCategories = catchAsync(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { menuItems: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
});

export const createCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }
  const category = await prisma.category.create({ data: { name, description } });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { name, description },
  });
  res.json({ success: true, data: category });
});

export const deleteCategory = catchAsync(async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Category deleted successfully" });
});
