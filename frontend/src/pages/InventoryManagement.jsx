import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_INVENTORY = [
  { id: 1, sku: 'INV-1001', name: 'Arborio Rice Bags (10kg)', category: 'Dry Goods', location: 'Main Store Room', stock: 15, minStock: 5, unitValue: '$35.00' },
  { id: 2, sku: 'INV-1002', name: 'Premium Olive Oil (5L)', category: 'Oils & Condiments', location: 'Kitchen Pantry', stock: 8, minStock: 4, unitValue: '$42.00' },
  { id: 3, sku: 'INV-1003', name: 'Eco Takeaway Containers (500pk)', category: 'Packaging', location: 'Warehouse B', stock: 3, minStock: 6, unitValue: '$28.00' },
  { id: 4, sku: 'INV-1004', name: 'Sanitizer Spray (1L)', category: 'Cleaning Supplies', location: 'Utility Closet', stock: 24, minStock: 10, unitValue: '$8.50' },
];

export default function InventoryManagement() {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Dry Goods', location: 'Main Store Room', stock: 10, minStock: 5, unitValue: '$20.00' });
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="text-slate-400 text-sm">Warehouse products, store locations & stock levels</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Add Product</button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => {
            const isLow = it.stock <= it.minStock;
            return (
              <div key={it.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400">{it.sku}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${isLow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{it.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Location: {it.location}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stock: <strong className="text-white">{it.stock} units</strong></span>
                  <span className="font-mono text-emerald-400 font-bold">{it.unitValue}/unit</span>
                </div>
              </div>
            );
          })}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Product</h3>
              <form onSubmit={(e) => { e.preventDefault(); setItems([...items, { id: Date.now(), sku: `INV-${Math.floor(1000 + Math.random() * 9000)}`, name: form.name, category: form.category, location: form.location, stock: Number(form.stock), minStock: Number(form.minStock), unitValue: form.unitValue }]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" required placeholder="Storage Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Stock Qty" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="text" required placeholder="Unit Value ($)" value={form.unitValue} onChange={(e) => setForm({ ...form, unitValue: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
