import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getIngredients = catchAsync(async (req, res) => {
  const ingredients = await prisma.ingredient.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: ingredients });
});

export const createIngredient = catchAsync(async (req, res) => {
  const { name, unit, category, currentStock, minStockLevel, costPerUnit, supplierId } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ success: false, message: "Name and unit are required" });
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      name,
      unit,
      category: category || null,
      currentStock: Number(currentStock || 0),
      minStockLevel: Number(minStockLevel || 10),
      costPerUnit: Number(costPerUnit || 0),
      supplierId: supplierId ? Number(supplierId) : null,
    },
    include: { supplier: true },
  });
  res.status(201).json({ success: true, data: ingredient });
});

export const updateIngredient = catchAsync(async (req, res) => {
  const { name, unit, category, currentStock, minStockLevel, costPerUnit, supplierId } = req.body;

  const ingredient = await prisma.ingredient.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name && { name }),
      ...(unit && { unit }),
      ...(category !== undefined && { category }),
      ...(currentStock !== undefined && { currentStock: Number(currentStock) }),
      ...(minStockLevel !== undefined && { minStockLevel: Number(minStockLevel) }),
      ...(costPerUnit !== undefined && { costPerUnit: Number(costPerUnit) }),
      ...(supplierId !== undefined && { supplierId: supplierId ? Number(supplierId) : null }),
    },
    include: { supplier: true },
  });
  res.json({ success: true, data: ingredient });
});

export const deleteIngredient = catchAsync(async (req, res) => {
  await prisma.ingredient.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Ingredient deleted successfully" });
});
