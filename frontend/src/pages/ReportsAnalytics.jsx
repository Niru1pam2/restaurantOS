import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getDashboardSummary } from '../api/dashboard.api';
import { getExpenses } from '../api/expenses.api';

export default function ReportsAnalytics() {
  const [period, setPeriod] = useState('This Month');
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, expRes] = await Promise.all([
        getDashboardSummary().catch(() => ({ success: false, data: null })),
        getExpenses().catch(() => ({ success: false, data: [] })),
      ]);
      if (dashRes.success) setSummary(dashRes.data);
      if (expRes.success) setExpenses(expRes.data);
    } catch (err) {
      console.error('Failed to load report metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = Number(summary?.sales?.totalRevenue || 0);
  const todayRevenue = Number(summary?.sales?.todayRevenue || 0);
  const totalOrders = Number(summary?.sales?.totalOrders || 0);
  const activeOrders = Number(summary?.activeOrdersCount || 0);
  const totalExpenseVal = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenseVal;

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    const catName = exp.category?.name || (typeof exp.category === 'string' ? exp.category : null) || 'General';
    const amt = Number(exp.amount || 0);
    acc[catName] = (acc[catName] || 0) + amt;
    return acc;
  }, {});

  const categoryList = Object.entries(categoryTotals).map(([catName, amt]) => ({
    categoryName: catName,
    amount: amt,
    percent: totalExpenseVal > 0 ? Math.round((amt / totalExpenseVal) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);
  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Financial Analytics</h1>
            <p className="text-slate-400 text-sm">Profitability metrics, expenditure analysis & operational performance</p>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm font-semibold">
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading metrics...</div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Total Revenue</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white font-mono">₹{Number(totalRevenue).toFixed(2)}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">Live</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Total Expenses</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-rose-400 font-mono">₹{Number(totalExpenseVal).toFixed(2)}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400">Total</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Net Estimate</span>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{Number(netProfit).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">Calculated</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Active Orders</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white font-mono">{totalOrders}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400">Current</span>
                </div>
              </div>
            </div>

            {/* Analytical Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-white">Recent Expense Log</h3>
                {expenses.length === 0 ? (
                  <p className="text-xs text-slate-500">No expense logs available.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {expenses.slice(0, 6).map((item) => {
                      const catName = item.category?.name || (typeof item.category === 'string' ? item.category : null) || 'General';
                      const vendorName = item.supplier?.name || item.vendor || (item.description?.startsWith('Vendor: ') ? item.description.replace('Vendor: ', '') : null) || 'N/A';
                      return (
                        <div key={item.id} className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                          <div>
                            <p className="text-sm font-bold text-white">{item.title || item.description || 'Expense'}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{catName} • <span className="text-indigo-400">{vendorName}</span></p>
                          </div>
                          <span className="text-sm font-mono font-bold text-rose-400">₹{Number(item.amount || 0).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-white">Expense Distribution by Category</h3>
                {categoryList.length === 0 ? (
                  <p className="text-xs text-slate-500">No category breakdown available.</p>
                ) : (
                  <div className="space-y-4">
                    {categoryList.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span className="font-semibold text-white">{item.categoryName}</span>
                          <span className="font-mono text-slate-300">{item.percent}% (₹{item.amount.toFixed(2)})</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-indigo-500 h-full" style={{ width: `${item.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
