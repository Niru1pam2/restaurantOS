import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_LOGS = [
  { id: 1, type: 'Stock In', item: 'Arborio Rice Bags', qty: '+10 units', reason: 'Purchase Order #PO-401', user: 'Marcus Vance', date: '2026-10-07 10:30 AM' },
  { id: 2, type: 'Stock Out', item: 'Wagyu Beef Patty', qty: '-5 units', reason: 'Kitchen Daily Usage', user: 'Gordon Ramsay', date: '2026-10-07 11:15 AM' },
  { id: 3, type: 'Stock Out', item: 'Button Mushrooms', qty: '-2 units', reason: 'Waste / Expired', user: 'Gordon Ramsay', date: '2026-10-07 09:00 AM' },
  { id: 4, type: 'Stock In', item: 'Truffle Oil', qty: '+4 units', reason: 'Supplier Direct Delivery', user: 'Elena Rostova', date: '2026-10-06 04:45 PM' },
];

export default function StockTransactions() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'Stock In', item: 'Arborio Rice Bags', qty: 5, reason: 'Purchase' });
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Stock In / Stock Out</h1>
            <p className="text-slate-400 text-sm">Log stock movement, replenishment & inventory adjustments</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Record Transaction</button>
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
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${log.type === 'Stock In' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                        {log.type === 'Stock In' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{log.item}</td>
                    <td className={`px-6 py-4 font-mono font-bold ${log.type === 'Stock In' ? 'text-emerald-400' : 'text-rose-400'}`}>{log.qty}</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{log.reason}</td>
                    <td className="px-6 py-4 text-xs text-indigo-300">{log.user}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Record Stock Transaction</h3>
              <form onSubmit={(e) => { e.preventDefault(); const prefix = form.type === 'Stock In' ? '+' : '-'; setLogs([{ id: Date.now(), type: form.type, item: form.item, qty: `${prefix}${form.qty} units`, reason: form.reason, user: user?.name || 'Staff', date: 'Just now' }, ...logs]); setModal(false); }} className="space-y-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="Stock In">Stock In (Entry)</option>
                  <option value="Stock Out">Stock Out (Exit)</option>
                </select>
                <input type="text" required placeholder="Item Name" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="number" min="1" required placeholder="Quantity" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" required placeholder="Reason / Notes" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Log Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
