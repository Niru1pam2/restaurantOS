import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  predictShortages,
  getReorderRecommendations,
  suggestMenuPricing,
  estimatePrepTime,
  analyzeWaste,
} from "../api/ai.api";

export default function AiInsights() {
  const [activeTab, setActiveTab] = useState("shortages");
  const [loading, setLoading] = useState(false);
  const [targetMargin, setTargetMargin] = useState(65);

  const [shortages, setShortages] = useState([]);
  const [reorders, setReorders] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [prepTime, setPrepTime] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const fetchAiData = async () => {
    setLoading(true);
    try {
      if (activeTab === "shortages") {
        const res = await predictShortages();
        if (res.success) { setShortages(res.data); setIsAiGenerated(res.aiGenerated); }
      } else if (activeTab === "reorder") {
        const res = await getReorderRecommendations();
        if (res.success) { setReorders(res.data); setIsAiGenerated(res.aiGenerated); }
      } else if (activeTab === "pricing") {
        const res = await suggestMenuPricing(targetMargin);
        if (res.success) { setPricing(res.data); setIsAiGenerated(res.aiGenerated); }
      } else if (activeTab === "preptime") {
        const res = await estimatePrepTime();
        if (res.success) { setPrepTime(res.data); setIsAiGenerated(res.aiGenerated); }
      } else if (activeTab === "waste") {
        const res = await analyzeWaste();
        if (res.success) { setWasteData(res.data); setIsAiGenerated(res.aiGenerated); }
      }
    } catch (err) {
      console.error("Failed to load AI features:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAiData(); }, [activeTab]);

  return (
    <Layout>
      <div className="w-full max-w-7xl space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Insights & Intelligence</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Powered by Groq LLM
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Real-time predictive analytics, pricing strategies & kitchen optimization.</p>
          </div>
          <button
            onClick={fetchAiData}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            {loading ? "Analyzing..." : "Refresh AI Intelligence"}
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "shortages", label: "Predict Shortages" },
            { id: "reorder", label: "Stock Reorders" },
            { id: "pricing", label: "Menu Pricing" },
            { id: "preptime", label: "Prep Time Estimator" },
            { id: "waste", label: "Waste Analysis" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "bg-slate-800 text-indigo-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{isAiGenerated ? <span className="text-emerald-400 font-medium">✓ Groq AI model active</span> : <span className="text-amber-400 font-medium">Algorithmic mode</span>}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <p className="text-slate-300 text-sm font-medium">Groq AI is processing your parameters...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "shortages" && <ShortagesView shortages={shortages} />}
            {activeTab === "reorder" && <ReordersView reorders={reorders} />}
            {activeTab === "pricing" && <PricingView pricing={pricing} targetMargin={targetMargin} setTargetMargin={setTargetMargin} onRefresh={fetchAiData} />}
            {activeTab === "preptime" && <PrepTimeView prepTime={prepTime} />}
            {activeTab === "waste" && <WasteView wasteData={wasteData} />}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ShortagesView({ shortages }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shortages.map((item) => (
        <div key={item.ingredientId} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-base font-bold text-white">{item.name}</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              item.riskLevel === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/40" :
              item.riskLevel === "MEDIUM" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            }`}>
              {item.riskLevel} RISK
            </span>
          </div>
          <div className="text-xs space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-300">Stock: <span className="font-bold text-white">{item.currentStock} {item.unit}</span> | Burnout: ~{item.daysRemaining} days</p>
            <p className="text-indigo-300">{item.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReordersView({ reorders }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
      {reorders.map((item) => (
        <div key={item.ingredientId} className="p-4 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-white">{item.name}</h4>
            <p className="text-xs text-slate-400">Supplier: {item.supplierName} | Stock: {item.currentStock} {item.unit}</p>
            {item.purchasingNote && <p className="text-xs text-indigo-300 mt-1">Groq Note: {item.purchasingNote}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold font-mono text-emerald-400">+{item.recommendedReorderQty} {item.unit}</p>
            <p className="text-xs font-mono text-white">₹{item.estimatedTotalCost}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PricingView({ pricing, targetMargin, setTargetMargin, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Target Margin:</span>
          <input type="range" min="40" max="85" value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value))} className="w-36 accent-indigo-500" />
          <span className="text-sm font-bold font-mono text-indigo-400">{targetMargin}%</span>
        </div>
        <button onClick={onRefresh} className="px-3 py-1.5 bg-slate-800 text-xs text-slate-200 rounded-lg border border-slate-700 cursor-pointer">Recalculate</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pricing.map((item) => (
          <div key={item.menuItemId} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-white">{item.name}</h4>
            <p className="text-xs text-slate-400">Current: ₹{item.currentPrice} | Cost: ₹{item.rawIngredientCost}</p>
            <p className="text-sm font-bold font-mono text-emerald-400">Suggested: ₹{item.suggestedPrice}</p>
            {item.pricingStrategyAdvice && <p className="text-xs text-indigo-300 italic">{item.pricingStrategyAdvice}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PrepTimeView({ prepTime }) {
  if (!prepTime) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Estimated Prep Time</span>
        <span className="text-2xl font-bold font-mono text-indigo-400">{prepTime.estimatedTotalMinutes} mins</span>
      </div>
      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">{prepTime.kitchenInsight}</p>
    </div>
  );
}

function WasteView({ wasteData }) {
  if (!wasteData) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Total Waste Cost</span>
        <span className="text-2xl font-bold font-mono text-red-400">₹{wasteData.totalWasteCost}</span>
      </div>
      <div className="space-y-2">
        {wasteData.actionableRecommendations?.map((rec, i) => (
          <p key={i} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">#{i + 1} {rec}</p>
        ))}
      </div>
    </div>
  );
}
