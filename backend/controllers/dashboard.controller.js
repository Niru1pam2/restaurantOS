import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

export const getDashboardSummary = catchAsync(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // 1. Sales & Orders Summary
  const totalSalesAggregate = await prisma.order.aggregate({
    where: { paymentStatus: "PAID" },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  const todaySalesAggregate = await prisma.order.aggregate({
    where: { paymentStatus: "PAID", createdAt: { gte: todayStart } },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  const activeOrdersCount = await prisma.order.count({
    where: { status: { in: ["PENDING", "PREPARING", "READY", "SERVED"] } },
  });

  // 2. Table Occupancy
  const totalTables = await prisma.table.count();
  const occupiedTables = await prisma.table.count({ where: { status: "OCCUPIED" } });
  const tableOccupancyPercent = totalTables > 0 ? Number(((occupiedTables / totalTables) * 100).toFixed(1)) : 0;

  // 3. Low Stock Ingredients
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true, currentStock: true, minStockLevel: true, unit: true },
  });
  const lowStockIngredients = ingredients.filter((ing) => ing.currentStock <= ing.minStockLevel);

  // 4. Monthly Expenses & Purchases
  const monthlyExpensesAggregate = await prisma.expense.aggregate({
    where: { date: { gte: monthStart } },
    _sum: { amount: true },
  });

  const monthlyPurchasesAggregate = await prisma.purchaseOrder.aggregate({
    where: { createdAt: { gte: monthStart }, status: "RECEIVED" },
    _sum: { totalAmount: true },
  });

  // 5. Profit Calculation
  const totalRevenue = totalSalesAggregate._sum.totalAmount || 0;
  const totalExpenses = (monthlyExpensesAggregate._sum.amount || 0) + (monthlyPurchasesAggregate._sum.totalAmount || 0);
  const estimatedProfit = Number((totalRevenue - totalExpenses).toFixed(2));

  // 6. Recent Activity
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { table: true },
  });

  res.json({
    success: true,
    data: {
      sales: {
        totalRevenue,
        totalOrders: totalSalesAggregate._count.id || 0,
        todayRevenue: todaySalesAggregate._sum.totalAmount || 0,
        todayOrders: todaySalesAggregate._count.id || 0,
      },
      activeOrdersCount,
      occupancy: { totalTables, occupiedTables, occupancyPercent: tableOccupancyPercent },
      lowStockItems: {
        ingredients: lowStockIngredients,
        totalLowStockCount: lowStockIngredients.length,
      },
      expenses: {
        monthlyExpenses: monthlyExpensesAggregate._sum.amount || 0,
        monthlyPurchases: monthlyPurchasesAggregate._sum.totalAmount || 0,
        totalMonthlyExpenses: totalExpenses,
      },
      profitOverview: { totalRevenue, totalExpenses, estimatedProfit },
      recentOrders,
    },
  });
});
