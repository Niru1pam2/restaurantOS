import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_SUPPLIERS = [
  { id: 1, name: 'AgriCorp Global', contact: 'John Miller (+1 555-0192)', category: 'Grain & Dry Goods', rating: '4.9/5', leadTime: '2 Days', activeOrders: 2 },
  { id: 2, name: 'Prime Cut Meats', contact: 'Sarah Jenkins (+1 555-0831)', category: 'Meat & Seafood', rating: '4.8/5', leadTime: '1 Day', activeOrders: 1 },
  { id: 3, name: 'Gourmet Imports', contact: 'Lucian Rossi (+1 555-0742)', category: 'Specialty Oils & Spices', rating: '4.7/5', leadTime: '4 Days', activeOrders: 0 },
  { id: 4, name: 'Dairy Fresh Co.', contact: 'Emma Watson (+1 555-0329)', category: 'Dairy & Eggs', rating: '4.9/5', leadTime: '1 Day', activeOrders: 3 },
];

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', category: 'Produce', leadTime: '2 Days' });
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Supplier Management</h1>
            <p className="text-slate-400 text-sm">Vendor contacts, supply categories & lead time metrics</p>
          </div>
          {['OWNER', 'MANAGER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Add Supplier</button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{sup.name}</h3>
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-md mt-1 inline-block">{sup.category}</span>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">{sup.rating}</span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <p><span className="text-slate-400">Contact Person:</span> {sup.contact}</p>
                <p><span className="text-slate-400">Average Lead Time:</span> {sup.leadTime}</p>
                <p><span className="text-slate-400">Active Purchase Orders:</span> <span className="text-indigo-400 font-semibold">{sup.activeOrders} Orders</span></p>
              </div>
            </div>
          ))}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add New Supplier</h3>
              <form onSubmit={(e) => { e.preventDefault(); setSuppliers([...suppliers, { id: Date.now(), name: form.name, contact: form.contact, category: form.category, rating: '5.0/5', leadTime: form.leadTime, activeOrders: 0 }]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Supplier Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" required placeholder="Contact Info / Phone" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" required placeholder="Category (e.g. Seafood)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Save Supplier</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
