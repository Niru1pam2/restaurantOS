import { useState, useEffect } from "react";
import { useAuth } from "../store/useAuthStore";
import Layout from "../components/Layout";
import { getDashboardSummary } from "../api/dashboard.api";

const ROLE_BADGES = {
  OWNER: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  MANAGER: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  CHEF: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  WAITER: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  CASHIER: "bg-teal-500/20 text-teal-300 border-teal-500/40",
};

export default function Dashboard() {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then((res) => res.success && setSummary(res.data)).catch(() => {});
  }, []);

  const roleBadgeStyle = ROLE_BADGES[user?.role] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <Layout>
      <div className="w-full max-w-6xl space-y-8">
        <div className="bg-linear-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-slate-400 text-sm mt-1">
              Role: <span className={`inline-block font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleBadgeStyle}`}>{user?.role}</span>
            </p>
          </div>
          <button onClick={() => logout()} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-sm font-semibold transition-all cursor-pointer">
            Sign Out
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Revenue</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">${summary.sales?.totalRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-slate-500">{summary.sales?.totalOrders || 0} Orders</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Today Revenue</span>
              <p className="text-2xl font-bold font-mono text-indigo-400">${summary.sales?.todayRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-slate-500">{summary.sales?.todayOrders || 0} Today</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Active Orders</span>
              <p className="text-2xl font-bold font-mono text-amber-400">{summary.activeOrdersCount || 0}</p>
              <p className="text-xs text-slate-500">In Kitchen Queue</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Occupancy</span>
              <p className="text-2xl font-bold font-mono text-purple-400">{summary.occupancy?.occupancyPercent || 0}%</p>
              <p className="text-xs text-slate-500">{summary.occupancy?.occupiedTables || 0} / {summary.occupancy?.totalTables || 0} Tables</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3 text-sm">
            <h2 className="text-lg font-bold text-white">User Account Profile</h2>
            <div className="flex justify-between py-2 border-b border-slate-800/80"><span className="text-slate-400">Full Name</span><span className="font-semibold text-white">{user?.name}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-800/80"><span className="text-slate-400">Email Address</span><span className="font-semibold text-white">{user?.email}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-800/80"><span className="text-slate-400">Role</span><span className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md border ${roleBadgeStyle}`}>{user?.role}</span></div>
          </div>

          {summary?.lowStockItems && (
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3">
              <h2 className="text-lg font-bold text-white flex justify-between">
                <span>Low Stock Alerts</span>
                <span className="text-xs font-bold bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/40">{summary.lowStockItems.totalLowStockCount} items</span>
              </h2>
              {summary.lowStockItems.ingredients.length === 0 ? (
                <p className="text-xs text-slate-400">All stock levels adequate.</p>
              ) : (
                <div className="space-y-2">
                  {summary.lowStockItems.ingredients.map((ing) => (
                    <div key={ing.id} className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-white">{ing.name}</span>
                      <span className="font-mono text-rose-400">{ing.currentStock} / {ing.minStockLevel} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

