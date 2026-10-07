import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_POS = [
  { id: 'PO-901', supplier: 'AgriCorp Global', total: '$850.00', status: 'Approved', date: '2026-10-05', itemsCount: 4 },
  { id: 'PO-902', supplier: 'Prime Cut Meats', total: '$1,420.00', status: 'Pending', date: '2026-10-06', itemsCount: 2 },
  { id: 'PO-903', supplier: 'Dairy Fresh Co.', total: '$380.00', status: 'Delivered', date: '2026-10-04', itemsCount: 5 },
  { id: 'PO-904', supplier: 'Gourmet Imports', total: '$610.00', status: 'Draft', date: '2026-10-07', itemsCount: 3 },
];

const BADGES = {
  Draft: 'bg-slate-700 text-slate-300 border-slate-600',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Approved: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function PurchaseOrders() {
  const [pos, setPos] = useState(INITIAL_POS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ supplier: 'AgriCorp Global', total: '500.00', itemsCount: 3 });
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
            <p className="text-slate-400 text-sm">Issue POs, track vendor fulfillment & procurement costs</p>
          </div>
          {['OWNER', 'MANAGER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Create Purchase Order</button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">{po.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{po.supplier}</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{po.itemsCount} line items</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{po.total}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{po.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${BADGES[po.status]}`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Create Purchase Order</h3>
              <form onSubmit={(e) => { e.preventDefault(); setPos([{ id: `PO-${900 + pos.length + 1}`, supplier: form.supplier, total: `$${form.total}`, status: 'Pending', date: '2026-10-07', itemsCount: Number(form.itemsCount) }, ...pos]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Supplier Name" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="number" step="0.01" required placeholder="Total Cost ($)" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="number" min="1" required placeholder="Number of Items" value={form.itemsCount} onChange={(e) => setForm({ ...form, itemsCount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Generate PO</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
