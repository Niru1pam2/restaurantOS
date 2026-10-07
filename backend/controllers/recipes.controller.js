import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getRecipes = catchAsync(async (req, res) => {
  const recipes = await prisma.recipeItem.findMany({
    include: {
      menuItem: { select: { id: true, name: true, price: true } },
      ingredient: { select: { id: true, name: true, unit: true, costPerUnit: true } },
    },
    orderBy: { menuItemId: "asc" },
  });
  res.json({ success: true, data: recipes });
});

export const addRecipeItem = catchAsync(async (req, res) => {
  const { menuItemId, ingredientId, quantityRequired, unit } = req.body;
  if (!menuItemId || !ingredientId || !quantityRequired || !unit) {
    return res.status(400).json({
      success: false,
      message: "menuItemId, ingredientId, quantityRequired, and unit are required",
    });
  }

  const recipeItem = await prisma.recipeItem.upsert({
    where: {
      menuItemId_ingredientId: {
        menuItemId: Number(menuItemId),
        ingredientId: Number(ingredientId),
      },
    },
    update: { quantityRequired: Number(quantityRequired), unit },
    create: {
      menuItemId: Number(menuItemId),
      ingredientId: Number(ingredientId),
      quantityRequired: Number(quantityRequired),
      unit,
    },
    include: { menuItem: true, ingredient: true },
  });
  res.json({ success: true, data: recipeItem });
});

export const deleteRecipeItem = catchAsync(async (req, res) => {
  await prisma.recipeItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Recipe item removed" });
});
