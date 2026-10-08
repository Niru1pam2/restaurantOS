import { ChatGroq } from "@langchain/groq";
import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

// Helper to initialize Groq LLM instance
const getGroqLLM = () => {
  const apiKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["\s]+|["\s]+$/g, "");
  if (!apiKey) return null;
  return new ChatGroq({
    apiKey,
    model: "openai/gpt-oss-20b",
    temperature: 0.2,
  });
};

/**
 * 1. Predict ingredient shortages
 * GET /api/ai/predict-shortages
 */
export const predictShortages = catchAsync(async (req, res) => {
  const ingredients = await prisma.ingredient.findMany({
    include: { recipeItems: { include: { menuItem: true } } },
  });

  const rawShortageData = ingredients.map((ing) => {
    const isCritical = ing.currentStock <= ing.minStockLevel;
    const isWarning = ing.currentStock <= ing.minStockLevel * 1.5 && !isCritical;
    const daysRemaining = ing.currentStock > 0 ? (ing.currentStock / (ing.minStockLevel || 1)).toFixed(1) : 0;
    const linkedDishes = ing.recipeItems.map((ri) => ri.menuItem?.name).filter(Boolean);

    return {
      ingredientId: ing.id,
      name: ing.name,
      currentStock: ing.currentStock,
      minStockLevel: ing.minStockLevel,
      unit: ing.unit,
      daysRemaining: Number(daysRemaining),
      isCritical,
      isWarning,
      linkedDishes,
    };
  });

  const llm = getGroqLLM();
  let aiInsights = null;

  if (llm) {
    try {
      const prompt = `You are an expert AI Restaurant Inventory Analyst powered by Groq.
Analyze the following inventory data and predict potential ingredient shortages and operational risks.

Inventory Data:
${JSON.stringify(rawShortageData, null, 2)}

Return a JSON array where each object has:
- ingredientId (number)
- name (string)
- currentStock (number)
- minStockLevel (number)
- unit (string)
- daysRemaining (number)
- riskLevel ("HIGH" | "MEDIUM" | "LOW")
- recommendation (short actionable text)
- impactSummary (impact on menu items)

Return strictly valid JSON format array only.`;

      const response = await llm.invoke(prompt);
      const cleanedText = response.content.replace(/```json|```/g, "").trim();
      aiInsights = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Groq AI prediction fallback to algorithmic:", error.message);
    }
  }

  // Algorithmic fallback if Groq unavailable or fails
  const predictions = aiInsights || rawShortageData.map((ing) => {
    let riskLevel = "LOW";
    let recommendation = "Stock level adequate.";
    let impactSummary = "No immediate menu disruption.";

    if (ing.isCritical) {
      riskLevel = "HIGH";
      recommendation = `CRITICAL SHORTAGE: Reorder immediately. Stock (${ing.currentStock} ${ing.unit}) is below limit (${ing.minStockLevel} ${ing.unit}).`;
      impactSummary = ing.linkedDishes.length > 0 ? `High risk for menu items: ${ing.linkedDishes.join(", ")}` : "High risk of stockout.";
    } else if (ing.isWarning) {
      riskLevel = "MEDIUM";
      recommendation = `Warning: Stock nearing threshold. Consider placing order soon.`;
      impactSummary = `Potential stock shortage during peak hours.`;
    }

    return {
      ingredientId: ing.ingredientId,
      name: ing.name,
      currentStock: ing.currentStock,
      minStockLevel: ing.minStockLevel,
      unit: ing.unit,
      daysRemaining: ing.daysRemaining,
      riskLevel,
      recommendation,
      impactSummary,
    };
  });

  res.json({ success: true, aiGenerated: Boolean(aiInsights), data: predictions });
});


/**
 * 2. Recommend stock reorder quantities
 * GET /api/ai/reorder-recommendations
 */
export const getReorderRecommendations = catchAsync(async (req, res) => {
  const ingredients = await prisma.ingredient.findMany({
    include: { supplier: true },
  });

  const lowStockIngredients = ingredients.filter((ing) => ing.currentStock <= ing.minStockLevel * 1.5);

  const llm = getGroqLLM();
  let aiRecommendations = null;

  if (llm && lowStockIngredients.length > 0) {
    try {
      const prompt = `You are a Smart Restaurant Procurement AI powered by Groq.
Recommend reorder quantities for the following low stock items:

Items:
${JSON.stringify(lowStockIngredients.map(i => ({
  id: i.id,
  name: i.name,
  currentStock: i.currentStock,
  minStockLevel: i.minStockLevel,
  unit: i.unit,
  costPerUnit: i.costPerUnit,
  supplier: i.supplier?.name || "Unassigned"
})), null, 2)}

Return a JSON array of objects with:
- ingredientId (number)
- name (string)
- currentStock (number)
- minStockLevel (number)
- unit (string)
- recommendedReorderQty (number)
- supplierName (string)
- unitCost (number)
- estimatedTotalCost (number)
- urgency ("URGENT" | "MODERATE" | "LOW")
- purchasingNote (short expert procurement advice)

Return strictly valid JSON format array only.`;

      const response = await llm.invoke(prompt);
      const cleanedText = response.content.replace(/```json|```/g, "").trim();
      aiRecommendations = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Groq AI reorder fallback to algorithmic:", error.message);
    }
  }

  // Fallback calculations if Groq not available or empty
  const recommendations = aiRecommendations || lowStockIngredients.map((ing) => {
    const targetStock = ing.minStockLevel * 3;
    const recommendedQty = Math.ceil(Math.max(0, targetStock - ing.currentStock));
    const estimatedCost = Number((recommendedQty * ing.costPerUnit).toFixed(2));
    const isCritical = ing.currentStock <= ing.minStockLevel;

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
      urgency: isCritical ? "URGENT" : "MODERATE",
      purchasingNote: isCritical ? "Reorder ASAP to prevent order cancellation" : "Standard batch replenishment recommended",
    };
  });

  res.json({ success: true, aiGenerated: Boolean(aiRecommendations), data: recommendations });
});

/**
 * 3. Suggest menu pricing
 * POST /api/ai/suggest-pricing
 */
export const suggestMenuPricing = catchAsync(async (req, res) => {
  const { targetMarginPercent = 65 } = req.body;

  const menuItems = await prisma.menuItem.findMany({
    include: { recipeItems: { include: { ingredient: true } } },
  });

  const itemCostData = menuItems.map((item) => {
    let rawCost = 0;
    item.recipeItems.forEach((ri) => {
      rawCost += (ri.quantityRequired || 0) * (ri.ingredient?.costPerUnit || 0);
    });
    return {
      menuItemId: item.id,
      name: item.name,
      currentPrice: item.price,
      rawIngredientCost: Number(rawCost.toFixed(2)),
    };
  });

  const llm = getGroqLLM();
  let aiSuggestions = null;

  if (llm) {
    try {
      const prompt = `You are a Restaurant Pricing Strategy AI powered by Groq.
Target Gross Margin: ${targetMarginPercent}%

Menu Data:
${JSON.stringify(itemCostData, null, 2)}

Calculate optimal suggested prices for maximum profitability and customer retention.
Return a JSON array of objects with:
- menuItemId (number)
- name (string)
- currentPrice (number)
- rawIngredientCost (number)
- currentMarginPercent (number)
- targetMarginPercent (number)
- suggestedPrice (number)
- priceDifference (number)
- pricingStrategyAdvice (1 sentence strategy tip)

Return strictly valid JSON format array only.`;

      const response = await llm.invoke(prompt);
      const cleanedText = response.content.replace(/```json|```/g, "").trim();
      aiSuggestions = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Groq AI pricing fallback to algorithmic:", error.message);
    }
  }

  // Fallback calculations
  const pricingSuggestions = aiSuggestions || itemCostData.map((item) => {
    const marginDecimal = targetMarginPercent / 100;
    const suggestedPrice = item.rawIngredientCost > 0 ? Number((item.rawIngredientCost / (1 - marginDecimal)).toFixed(2)) : item.currentPrice;
    const currentMargin = item.currentPrice > 0 ? Number((((item.currentPrice - item.rawIngredientCost) / item.currentPrice) * 100).toFixed(1)) : 0;
    const diff = Number((suggestedPrice - item.currentPrice).toFixed(2));

    let advice = "Price is well aligned with profit margin.";
    if (diff > 0) advice = `Increase price by ₹${diff} to achieve target ${targetMarginPercent}% margin.`;
    else if (diff < 0) advice = `High margin dish. Strong candidate for promotions or combo deals.`;

    return {
      menuItemId: item.menuItemId,
      name: item.name,
      currentPrice: item.currentPrice,
      rawIngredientCost: item.rawIngredientCost,
      currentMarginPercent: currentMargin,
      targetMarginPercent,
      suggestedPrice,
      priceDifference: diff,
      pricingStrategyAdvice: advice,
    };
  });

  res.json({ success: true, aiGenerated: Boolean(aiSuggestions), data: pricingSuggestions });
});


/**
 * 4. Estimate food preparation time
 * GET /api/ai/estimate-prep-time
 */
export const estimatePrepTime = catchAsync(async (req, res) => {
  const activeOrders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "PREPARING"] } },
    include: { items: { include: { menuItem: true } } },
  });

  const queueSummary = {
    activeOrdersCount: activeOrders.length,
    totalItemsInQueue: activeOrders.reduce((acc, o) => acc + o.items.length, 0),
    itemsList: activeOrders.flatMap(o => o.items.map(i => i.menuItem?.name)).filter(Boolean),
  };

  const llm = getGroqLLM();
  let aiPrepEstimate = null;

  if (llm) {
    try {
      const prompt = `You are a Kitchen Workflow & Prep Time Estimator AI powered by Groq.
Kitchen Queue Summary:
${JSON.stringify(queueSummary, null, 2)}

Estimate the prep time for new incoming orders and current bottlenecks.
Return a JSON object with:
- activeOrdersQueue (number)
- totalItemsInQueue (number)
- estimatedTotalMinutes (number)
- queueDelayMinutes (number)
- status ("NORMAL" | "BUSY" | "OVERLOADED")
- kitchenInsight (2 sentence advice on prep flow and bottlenecks)

Return strictly valid JSON format object only.`;

      const response = await llm.invoke(prompt);
      const cleanedText = response.content.replace(/```json|```/g, "").trim();
      aiPrepEstimate = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Groq AI prep time fallback to algorithmic:", error.message);
    }
  }

  // Fallback
  const basePrepTime = 15;
  const dynamicDelay = queueSummary.activeOrdersCount * 3;
  const estimatedTotal = aiPrepEstimate?.estimatedTotalMinutes || (basePrepTime + dynamicDelay);

  const result = aiPrepEstimate || {
    activeOrdersQueue: queueSummary.activeOrdersCount,
    totalItemsInQueue: queueSummary.totalItemsInQueue,
    basePrepTimeMinutes: basePrepTime,
    queueDelayMinutes: dynamicDelay,
    estimatedTotalMinutes: estimatedTotal,
    status: queueSummary.activeOrdersCount > 7 ? "OVERLOADED" : queueSummary.activeOrdersCount > 4 ? "BUSY" : "NORMAL",
    kitchenInsight: queueSummary.activeOrdersCount > 4 
      ? "Kitchen experiencing elevated volume. Prioritize fast prep appetizers first."
      : "Kitchen operating at normal efficiency. Orders flowing smoothly.",
  };

  res.json({ success: true, aiGenerated: Boolean(aiPrepEstimate), data: result });
});

/**
 * 5. Analyze ingredient waste and provide recommendations
 * GET /api/ai/waste-analysis
 */
export const analyzeWaste = catchAsync(async (req, res) => {
  const wasteLogs = await prisma.stockTransaction.findMany({
    where: { type: "WASTE" },
    include: { ingredient: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
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
    wasteByItem[name].totalCost += Number(cost.toFixed(2));
  });

  const wasteSummary = {
    totalWasteLogs: wasteLogs.length,
    totalWasteCost: Number(totalWasteCost.toFixed(2)),
    topWastedIngredients: Object.values(wasteByItem),
  };

  const llm = getGroqLLM();
  let aiWasteAnalysis = null;

  if (llm && wasteLogs.length > 0) {
    try {
      const prompt = `You are a Restaurant Food Waste Minimization AI powered by Groq.
Analyze the following waste log summary:

${JSON.stringify(wasteSummary, null, 2)}

Provide a detailed analysis and targeted actionable recommendations.
Return a JSON object with:
- totalWasteCost (number)
- wasteBreakdown (array of { name, quantity, unit, totalCost })
- overallRiskAssessment ("CRITICAL" | "MODERATE" | "WELL_CONTROLLED")
- actionableRecommendations (array of 3-5 specific operational strategies to reduce this waste)
- potentialMonthlySavingsEstimate (number)

Return strictly valid JSON format object only.`;

      const response = await llm.invoke(prompt);
      const cleanedText = response.content.replace(/```json|```/g, "").trim();
      aiWasteAnalysis = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Groq AI waste analysis fallback to algorithmic:", error.message);
    }
  }

  const result = aiWasteAnalysis || {
    totalWasteCost: wasteSummary.totalWasteCost,
    wasteBreakdown: wasteSummary.topWastedIngredients,
    overallRiskAssessment: wasteSummary.totalWasteCost > 100 ? "MODERATE" : "WELL_CONTROLLED",
    actionableRecommendations: [
      "Implement First-In-First-Out (FIFO) stock rotation for high-perishable produce.",
      "Reduce batch prep sizes during slow weekday hours.",
      "Check storage refrigeration temperatures for dairy and meat products.",
      "Review portions for items with high kitchen wastage.",
    ],
    potentialMonthlySavingsEstimate: Number((wasteSummary.totalWasteCost * 0.4).toFixed(2)),
  };

  res.json({ success: true, aiGenerated: Boolean(aiWasteAnalysis), data: result });
});
