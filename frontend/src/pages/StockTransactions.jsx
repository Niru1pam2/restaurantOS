import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getStockTransactions, createStockTransaction } from '../api/inventory.api';
import { getIngredients } from '../api/ingredients.api';

export default function StockTransactions() {
  const [logs, setLogs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'IN', ingredientId: '', quantityChange: 5, reason: 'PURCHASE', notes: '' });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, ingRes] = await Promise.all([
        getStockTransactions().catch(() => ({ success: false, data: [] })),
        getIngredients().catch(() => ({ success: false, data: [] })),
      ]);
      if (txRes.success && txRes.data) setLogs(txRes.data);
      if (ingRes.success && ingRes.data) setIngredients(ingRes.data);
    } catch (err) {
      console.error('Failed to load stock transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ingredientId: Number(form.ingredientId),
        type: form.type,
        quantityChange: Number(form.quantityChange),
        reason: form.reason,
        notes: form.notes,
      };
      const res = await createStockTransaction(payload);
      if (res.success) {
        setLogs([res.data, ...logs]);
        setModal(false);
        setForm({ type: 'IN', ingredientId: '', quantityChange: 5, reason: 'PURCHASE', notes: '' });
      }
    } catch (err) {
      console.error('Failed to log transaction', err);
    }
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Stock In / Stock Out</h1>
            <p className="text-slate-400 text-sm">Log stock movement, replenishment & inventory adjustments</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer">+ Record Transaction</button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Transaction Type</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4">Logged By</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading stock transactions...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No stock transactions found.</td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isStockIn = log.type === 'IN' || log.type === 'Stock In';
                    const qtyVal = Math.abs(log.quantityChange !== undefined ? log.quantityChange : (log.quantity || 0));
                    const qtyStr = `${isStockIn ? '+' : '-'}${qtyVal} ${log.ingredient?.unit || ''}`;
                    const itemName = log.ingredient?.name || (typeof log.item === 'string' ? log.item : null) || 'Item';
                    const userName = log.creator?.name || log.user?.name || (typeof log.user === 'string' ? log.user : null) || 'System';
                    const notesStr = log.notes || log.reason || 'N/A';
                    const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString() : (log.date || 'N/A');

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isStockIn ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                            {isStockIn ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">{itemName}</td>
                        <td className={`px-6 py-4 font-mono font-bold ${isStockIn ? 'text-emerald-400' : 'text-rose-400'}`}>{qtyStr}</td>
                        <td className="px-6 py-4 text-xs text-slate-300">{notesStr}</td>
                        <td className="px-6 py-4 text-xs text-indigo-300">{userName}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">{dateStr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Record Stock Transaction</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="IN">Stock In (Entry)</option>
                  <option value="OUT">Stock Out (Exit)</option>
                </select>
                <select required value={form.ingredientId} onChange={(e) => setForm({ ...form, ingredientId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="">Select Ingredient</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                  ))}
                </select>
                <input type="number" min="1" required placeholder="Quantity" value={form.quantityChange} onChange={(e) => setForm({ ...form, quantityChange: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" placeholder="Reason / Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Log Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
