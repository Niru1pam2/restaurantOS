import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Predict ingredient shortages based on stock levels vs min stock levels
 * GET /api/ai/predict-shortages
 */
export const predictShortages = catchAsync(async (req, res) => {
  const ingredients = await prisma.ingredient.findMany({
    include: { recipeItems: { include: { menuItem: true } } },
  });

  const predictions = ingredients.map((ing) => {
    const isCritical = ing.currentStock <= ing.minStockLevel;
    const isWarning = ing.currentStock <= ing.minStockLevel * 1.5 && !isCritical;
    const daysRemaining = ing.currentStock > 0 ? (ing.currentStock / (ing.minStockLevel || 1)).toFixed(1) : 0;

    let riskLevel = "LOW";
    let recommendation = "Stock level adequate.";

    if (isCritical) {
      riskLevel = "HIGH";
      recommendation = `CRITICAL SHORTAGE: Reorder immediately. Stock (${ing.currentStock} ${ing.unit}) is below minimum limit (${ing.minStockLevel} ${ing.unit}).`;
    } else if (isWarning) {
      riskLevel = "MEDIUM";
      recommendation = `Warning: Stock nearing threshold. Consider placing order with supplier.`;
    }

    return {
      ingredientId: ing.id,
      name: ing.name,
      currentStock: ing.currentStock,
      minStockLevel: ing.minStockLevel,
      unit: ing.unit,
      daysRemaining: Number(daysRemaining),
      riskLevel,
      recommendation,
    };
  });

  res.json({ success: true, data: predictions });
});

/**
 * Recommend stock reorder quantities
 * GET /api/ai/reorder-recommendations
 */
export const getReorderRecommendations = catchAsync(async (req, res) => {
  const ingredients = await prisma.ingredient.findMany({
    include: { supplier: true },
  });

  const recommendations = ingredients
    .filter((ing) => ing.currentStock <= ing.minStockLevel * 1.5)
    .map((ing) => {
      const targetStock = ing.minStockLevel * 3;
      const recommendedQty = Math.ceil(Math.max(0, targetStock - ing.currentStock));
      const estimatedCost = Number((recommendedQty * ing.costPerUnit).toFixed(2));

      return {
        ingredientId: ing.id,
        name: ing.name,
        currentStock: ing.currentStock,
        minStockLevel: ing.minStockLevel,
        unit: ing.unit,
        recommendedReorderQty: recommendedQty,
        supplierName: ing.supplier?.name || "Unassigned",
        unitCost: ing.costPerUnit,
        estimatedTotalCost: estimatedCost,
      };
    });

  res.json({ success: true, data: recommendations });
});

/**
 * Suggest menu pricing based on ingredient costs & margin target
 * POST /api/ai/suggest-pricing
 */
export const suggestMenuPricing = catchAsync(async (req, res) => {
  const { targetMarginPercent = 65 } = req.body;

  const menuItems = await prisma.menuItem.findMany({
    include: { recipeItems: { include: { ingredient: true } } },
  });

  const pricingSuggestions = menuItems.map((item) => {
    let recipeCost = 0;
    item.recipeItems.forEach((ri) => {
      recipeCost += ri.quantityRequired * ri.ingredient.costPerUnit;
    });

    recipeCost = Number(recipeCost.toFixed(2));
    const marginDecimal = targetMarginPercent / 100;
    const suggestedPrice = recipeCost > 0 ? Number((recipeCost / (1 - marginDecimal)).toFixed(2)) : item.price;
    const currentMargin = item.price > 0 ? Number((((item.price - recipeCost) / item.price) * 100).toFixed(1)) : 0;

    return {
      menuItemId: item.id,
      name: item.name,
      currentPrice: item.price,
      rawIngredientCost: recipeCost,
      currentMarginPercent: currentMargin,
      targetMarginPercent,
      suggestedPrice,
      priceDifference: Number((suggestedPrice - item.price).toFixed(2)),
    };
  });

  res.json({ success: true, data: pricingSuggestions });
});

/**
 * Estimate food preparation time based on kitchen queue
 * GET /api/ai/estimate-prep-time
 */
export const estimatePrepTime = catchAsync(async (req, res) => {
  const activeOrdersCount = await prisma.order.count({
    where: { status: { in: ["PENDING", "PREPARING"] } },
  });

  const basePrepTime = 15;
  const dynamicDelay = activeOrdersCount * 3;
  const estimatedMinutes = basePrepTime + dynamicDelay;

  res.json({
    success: true,
    data: {
      activeOrdersQueue: activeOrdersCount,
      basePrepTimeMinutes: basePrepTime,
      queueDelayMinutes: dynamicDelay,
      estimatedTotalMinutes: estimatedMinutes,
      status: activeOrdersCount > 5 ? "BUSY" : "NORMAL",
    },
  });
});

/**
 * Analyze ingredient waste
 * GET /api/ai/waste-analysis
 */
export const analyzeWaste = catchAsync(async (req, res) => {
  const wasteLogs = await prisma.stockTransaction.findMany({
    where: { type: "WASTE" },
    include: { ingredient: true },
    orderBy: { createdAt: "desc" },
  });

  let totalWasteCost = 0;
  const wasteByItem = {};

  wasteLogs.forEach((log) => {
    const name = log.ingredient?.name || "Unknown";
    const unitCost = log.ingredient?.costPerUnit || 0;
    const cost = log.quantity * unitCost;

    totalWasteCost += cost;
    if (!wasteByItem[name]) {
      wasteByItem[name] = { name, quantity: 0, totalCost: 0, unit: log.ingredient?.unit || "" };
    }
    wasteByItem[name].quantity += log.quantity;
    wasteByItem[name].totalCost += cost;
  });

  res.json({
    success: true,
    data: {
      totalWasteCost: Number(totalWasteCost.toFixed(2)),
      wasteBreakdown: Object.values(wasteByItem),
      recommendations: [
        "Implement First-In-First-Out (FIFO) stock rotation for high-perishable produce.",
        "Reduce batch prep sizes during slow weekday hours.",
        "Check storage refrigeration temperatures for dairy and meat products.",
      ],
    },
  });
});