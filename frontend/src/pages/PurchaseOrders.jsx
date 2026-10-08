import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getPurchaseOrders, createPurchaseOrder } from '../api/inventory.api';
import { getSuppliers } from '../api/suppliers.api';

const BADGES = {
  DRAFT: 'bg-slate-700 text-slate-300 border-slate-600',
  Draft: 'bg-slate-700 text-slate-300 border-slate-600',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Approved: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ supplierId: '', totalCost: '500.00' });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poRes, supRes] = await Promise.all([
        getPurchaseOrders().catch(() => ({ success: false, data: [] })),
        getSuppliers().catch(() => ({ success: false, data: [] })),
      ]);
      if (poRes.success && poRes.data) setPos(poRes.data);
      if (supRes.success && supRes.data) setSuppliers(supRes.data);
    } catch (err) {
      console.error('Failed to load purchase orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        totalAmount: Number(form.totalCost) || 0,
      };
      const res = await createPurchaseOrder(payload);
      if (res.success) {
        setPos([res.data, ...pos]);
        setModal(false);
        setForm({ supplierId: '', totalCost: '500.00' });
      }
    } catch (err) {
      console.error('Failed to create purchase order', err);
    }
  };

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
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading purchase orders...</td>
                  </tr>
                ) : pos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No purchase orders found.</td>
                  </tr>
                ) : (
                  pos.map((po) => {
                    const poCode = po.poNumber || po.code || `PO-${po.id}`;
                    const supplierName = po.supplier?.name || po.supplierName || 'General Supplier';
                    const totalVal = Number(po.totalAmount || po.total || 0).toFixed(2);
                    const statusStr = po.status || 'PENDING';
                    return (
                      <tr key={po.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-400">{poCode}</td>
                        <td className="px-6 py-4 font-bold text-white">{supplierName}</td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-400">₹{totalVal}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{po.createdAt ? new Date(po.createdAt).toLocaleDateString() : (po.date || 'N/A')}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${BADGES[statusStr] || BADGES.Pending}`}>
                            {statusStr}
                          </span>
                        </td>
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
              <h3 className="text-lg font-bold text-white">Create Purchase Order</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <input type="number" step="0.01" required placeholder="Total Cost (₹)" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Generate PO</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
