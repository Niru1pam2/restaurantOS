import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_ORDERS = [
  { id: 'ORD-101', table: 'T-01', items: ['Truffle Pasta x2', 'Red Wine x1'], total: 68.50, status: 'Preparing', type: 'Dine-In', time: '12 mins ago' },
  { id: 'ORD-102', table: 'T-04', items: ['Margherita Pizza x1', 'Caesar Salad x1'], total: 32.00, status: 'Pending', type: 'Dine-In', time: '5 mins ago' },
  { id: 'ORD-103', table: 'Takeaway-02', items: ['Wagyu Burger x2', 'Fries x2'], total: 44.00, status: 'Ready', type: 'Takeaway', time: '20 mins ago' },
  { id: 'ORD-104', table: 'T-03', items: ['Grilled Salmon x3', 'Sparkling Water x3'], total: 112.50, status: 'Served', type: 'Dine-In', time: '45 mins ago' },
  { id: 'ORD-105', table: 'T-08', items: ['Ribeye Steak x1', 'Tiramisu x1'], total: 54.00, status: 'Paid', type: 'Dine-In', time: '1 hour ago' },
];

const BADGES = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Preparing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Ready: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Served: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Paid: 'bg-slate-700 text-slate-300 border-slate-600',
};

export default function OrderManagement() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filter, setFilter] = useState('ALL');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ table: 'T-02', items: '', total: '', type: 'Dine-In' });
  const user = useAuth((s) => s.user);

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Order Management</h1>
            <p className="text-slate-400 text-sm">Track active kitchen orders and customer billing</p>
          </div>
          {['OWNER', 'MANAGER', 'WAITER', 'CASHIER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Create Order</button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between"><span className="text-slate-400 text-sm">Active Orders</span><span className="text-xl font-bold text-white">{orders.filter(o => o.status !== 'Paid').length}</span></div>
          <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-500/20 flex justify-between"><span className="text-blue-400 text-sm">Preparing</span><span className="text-xl font-bold text-blue-400">{orders.filter(o => o.status === 'Preparing').length}</span></div>
          <div className="bg-purple-950/20 p-4 rounded-xl border border-purple-500/20 flex justify-between"><span className="text-purple-400 text-sm">Ready</span><span className="text-xl font-bold text-purple-400">{orders.filter(o => o.status === 'Ready').length}</span></div>
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between"><span className="text-emerald-400 text-sm">Served</span><span className="text-xl font-bold text-emerald-400">{orders.filter(o => o.status === 'Served').length}</span></div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'Pending', 'Preparing', 'Ready', 'Served', 'Paid'].map((st) => (
            <button key={st} onClick={() => setFilter(st)} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${filter === st ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{st}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-indigo-400">{o.id}</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">{o.table}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${BADGES[o.status]}`}>{o.status}</span>
                </div>
                <div className="mt-3 space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Ordered Items:</span>
                  <ul className="text-sm text-slate-200 list-disc list-inside">
                    {o.items.map((it, idx) => <li key={idx}>{it}</li>)}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Total: </span>
                  <span className="text-base font-bold text-white">${o.total.toFixed(2)}</span>
                </div>
                <select value={o.status} onChange={(e) => setOrders(orders.map(item => item.id === o.id ? { ...item, status: e.target.value } : item))} className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white">
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Served">Served</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Create New Order</h3>
              <form onSubmit={(e) => { e.preventDefault(); setOrders([{ id: `ORD-${100 + orders.length + 1}`, table: form.table, items: form.items.split(','), total: Number(form.total) || 25, status: 'Pending', type: form.type, time: 'Just now' }, ...orders]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Table / Identifier (e.g. T-02)" value={form.table} onChange={(e) => setForm({ ...form, table: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <textarea required placeholder="Items (comma separated, e.g. Pizza x1, Soda x2)" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="number" step="0.01" required placeholder="Total Amount ($)" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Submit Order</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
