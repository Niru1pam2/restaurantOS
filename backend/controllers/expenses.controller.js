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
  const { title, amount, categoryId, category, categoryName, supplierId, vendor, status, date, description, receiptUrl } = req.body;
  
  const expenseTitle = title || description;
  if (!expenseTitle || !amount) {
    return res.status(400).json({ success: false, message: "Title and amount are required" });
  }

  let finalCategoryId = categoryId ? Number(categoryId) : null;

  if (!finalCategoryId) {
    const catName = category || categoryName || "General";
    let dbCategory = await prisma.expenseCategory.findFirst({
      where: { name: { equals: catName, mode: "insensitive" } },
    });
    if (!dbCategory) {
      dbCategory = await prisma.expenseCategory.create({
        data: { name: catName },
      });
    }
    finalCategoryId = dbCategory.id;
  }

  let finalSupplierId = supplierId ? Number(supplierId) : null;
  if (!finalSupplierId && vendor && typeof vendor === "string" && vendor.trim()) {
    const vendorName = vendor.trim();
    let supplier = await prisma.supplier.findFirst({
      where: { name: { equals: vendorName, mode: "insensitive" } },
    });
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { name: vendorName },
      });
    }
    finalSupplierId = supplier.id;
  }

  const expenseStatus = status && ["PAID", "PENDING"].includes(status.toUpperCase()) ? status.toUpperCase() : "PAID";
  const finalDescription = description || (vendor ? `Vendor: ${vendor}` : null);

  const expense = await prisma.expense.create({
    data: {
      title: expenseTitle,
      amount: Number(amount),
      status: expenseStatus,
      categoryId: finalCategoryId,
      supplierId: finalSupplierId,
      date: date ? new Date(date) : new Date(),
      description: finalDescription,
      receiptUrl,
      userId: req.user?.id || null,
    },
    include: { category: true, supplier: true, user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: expense });
});

export const deleteExpense = catchAsync(async (req, res) => {
  await prisma.expense.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Expense deleted" });
});
