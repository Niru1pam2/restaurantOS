import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

// ---------- Expense Categories ----------
export const getExpenseCategories = catchAsync(async (req, res) => {
  const categories = await prisma.expenseCategory.findMany({
    include: { _count: { select: { expenses: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
});

export const createExpenseCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Name is required" });

  const category = await prisma.expenseCategory.create({ data: { name, description } });
  res.status(201).json({ success: true, data: category });
});

// ---------- Expenses ----------
export const getExpenses = catchAsync(async (req, res) => {
  const expenses = await prisma.expense.findMany({
    include: {
      category: true,
      supplier: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });
  res.json({ success: true, data: expenses });
});

export const createExpense = catchAsync(async (req, res) => {
  const { title, amount, categoryId, supplierId, date, description, receiptUrl } = req.body;
  if (!title || !amount || !categoryId) {
    return res.status(400).json({ success: false, message: "Title, amount, and categoryId are required" });
  }

  const expense = await prisma.expense.create({
    data: {
      title,
      amount: Number(amount),
      categoryId: Number(categoryId),
      supplierId: supplierId ? Number(supplierId) : null,
      date: date ? new Date(date) : new Date(),
      description,
      receiptUrl,
      userId: req.user.id,
    },
    include: { category: true, supplier: true },
  });

  res.status(201).json({ success: true, data: expense });
});

export const deleteExpense = catchAsync(async (req, res) => {
  await prisma.expense.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Expense deleted" });
});
