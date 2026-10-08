import { useState, useEffect } from "react";
import { useAuth } from "../store/useAuthStore";
import Layout from "../components/Layout";
import { getDashboardSummary } from "../api/dashboard.api";
import { FiDollarSign, FiShoppingBag, FiUsers, FiAlertTriangle, FiUserCheck, FiLogOut } from "react-icons/fi";

const ROLE_BADGES = {
  OWNER: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
  MANAGER: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  CHEF: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  WAITER: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  CASHIER: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
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
      <div className="w-full max-w-6xl space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, {user?.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
              Role Permission: <span className={`inline-block font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${roleBadgeStyle}`}>{user?.role}</span>
            </p>
          </div>
          <button onClick={() => logout()} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-300 dark:border-slate-700 dark:hover:border-rose-800/60 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0">
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <FiDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">₹{summary.sales?.totalRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{summary.sales?.totalOrders || 0} Orders Lifetime</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Today Revenue</span>
                <FiDollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">₹{summary.sales?.todayRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{summary.sales?.todayOrders || 0} Orders Today</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Orders</span>
                <FiShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{summary.activeOrdersCount || 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">In Kitchen Queue</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Table Occupancy</span>
                <FiUsers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{summary.occupancy?.occupancyPercent || 0}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{summary.occupancy?.occupiedTables || 0} / {summary.occupancy?.totalTables || 0} Tables Occupied</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4 text-sm transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiUserCheck className="w-4 h-4 text-slate-500" />
              Account Details
            </h2>
            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="flex justify-between py-2"><span className="text-slate-500 dark:text-slate-400 font-medium">Full Name</span><span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span></div>
              <div className="flex justify-between py-2"><span className="text-slate-500 dark:text-slate-400 font-medium">Email Address</span><span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span></div>
              <div className="flex justify-between py-2"><span className="text-slate-500 dark:text-slate-400 font-medium">Role</span><span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md border ${roleBadgeStyle}`}>{user?.role}</span></div>
            </div>
          </div>

          {summary?.lowStockItems && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4 transition-colors">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4 text-amber-500" />
                  Low Stock Inventory
                </span>
                <span className="text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full">{summary.lowStockItems.totalLowStockCount} items</span>
              </h2>
              {summary.lowStockItems.ingredients.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">All stock levels are optimal.</p>
              ) : (
                <div className="space-y-2">
                  {summary.lowStockItems.ingredients.map((ing) => (
                    <div key={ing.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">{ing.name}</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{ing.currentStock} / {ing.minStockLevel} {ing.unit}</span>
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

