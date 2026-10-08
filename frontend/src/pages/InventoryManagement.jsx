import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getIngredients, createIngredient } from '../api/ingredients.api';

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Dry Goods', currentStock: 10, minStockLevel: 5, unitCost: 20, unit: 'units' });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getIngredients();
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load inventory items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        currentStock: Number(form.currentStock),
        minStockLevel: Number(form.minStockLevel),
        costPerUnit: Number(form.unitCost),
        unitCost: Number(form.unitCost),
        unit: form.unit || 'units',
      };
      const res = await createIngredient(payload);
      if (res.success) {
        setItems([...items, res.data]);
        setModal(false);
        setForm({ name: '', category: 'Dry Goods', currentStock: 10, minStockLevel: 5, unitCost: 20, unit: 'units' });
      } else {
        setErrorMsg(res.message || 'Failed to add inventory product');
      }
    } catch (err) {
      console.error('Failed to create item', err);
      setErrorMsg(err.response?.data?.message || 'Error creating inventory product');
    }
  };

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

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading inventory...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No inventory items found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((it) => {
              const currentStock = it.currentStock ?? it.stock ?? 0;
              const minStock = it.minStockLevel ?? it.minStock ?? 0;
              const isLow = currentStock <= minStock;
              return (
                <div key={it.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-400">INV-{it.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${isLow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{it.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Category: {it.category || 'General'}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Stock: <strong className="text-white">{currentStock} {it.unit || 'units'}</strong></span>
                    <span className="font-mono text-emerald-400 font-bold">₹{Number(it.costPerUnit ?? it.unitCost ?? 0).toFixed(2)}/unit</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Product</h3>
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-3">
                <input type="text" required placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Stock Qty" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="number" step="0.01" required placeholder="Unit Value (₹)" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
