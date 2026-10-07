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
  const { name, unit, category, currentStock, minStockLevel, costPerUnit, unitCost, supplierId } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ success: false, message: "Name and unit are required" });
  }

  const cost = costPerUnit !== undefined && costPerUnit !== null
    ? Number(costPerUnit)
    : unitCost !== undefined && unitCost !== null
    ? Number(unitCost)
    : 0;

  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: String(name).trim(),
        unit: String(unit).trim(),
        category: category || null,
        currentStock: Number(currentStock || 0),
        minStockLevel: Number(minStockLevel || 10),
        costPerUnit: cost,
        supplierId: supplierId ? Number(supplierId) : null,
      },
      include: { supplier: true },
    });
    res.status(201).json({ success: true, data: ingredient });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: `An ingredient with name "${name}" already exists.` });
    }
    throw error;
  }
});

export const updateIngredient = catchAsync(async (req, res) => {
  const { name, unit, category, currentStock, minStockLevel, costPerUnit, unitCost, supplierId } = req.body;

  const cost = costPerUnit !== undefined && costPerUnit !== null
    ? Number(costPerUnit)
    : unitCost !== undefined && unitCost !== null
    ? Number(unitCost)
    : undefined;

  const ingredient = await prisma.ingredient.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name && { name: String(name).trim() }),
      ...(unit && { unit: String(unit).trim() }),
      ...(category !== undefined && { category }),
      ...(currentStock !== undefined && { currentStock: Number(currentStock) }),
      ...(minStockLevel !== undefined && { minStockLevel: Number(minStockLevel) }),
      ...(cost !== undefined && { costPerUnit: cost }),
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

