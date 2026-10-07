import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getMenuItems = catchAsync(async (req, res) => {
  const menuItems = await prisma.menuItem.findMany({
    include: {
      category: true,
      recipeItems: { include: { ingredient: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: menuItems });
});

export const createMenuItem = catchAsync(async (req, res) => {
  const { name, description, price, categoryId, prepTimeMinutes, imageUrl, isAvailable } = req.body;
  if (!name || price === undefined || !categoryId) {
    return res.status(400).json({ success: false, message: "Name, price, and categoryId are required" });
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price: Number(price),
      categoryId: Number(categoryId),
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : 15,
      imageUrl,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    },
    include: { category: true },
  });
  res.status(201).json({ success: true, data: menuItem });
});

export const updateMenuItem = catchAsync(async (req, res) => {
  const { name, description, price, categoryId, prepTimeMinutes, imageUrl, isAvailable } = req.body;

  const menuItem = await prisma.menuItem.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(prepTimeMinutes !== undefined && { prepTimeMinutes: Number(prepTimeMinutes) }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
    },
    include: { category: true },
  });
  res.json({ success: true, data: menuItem });
});

export const deleteMenuItem = catchAsync(async (req, res) => {
  await prisma.menuItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Menu item deleted successfully" });
});
