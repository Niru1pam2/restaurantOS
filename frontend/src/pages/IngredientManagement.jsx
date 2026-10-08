import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getIngredients, createIngredient } from '../api/ingredients.api';

export default function IngredientManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Produce', currentStock: 10, unit: 'kg', minStockLevel: 5, unitCost: 5 });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getIngredients();
      if (res.success) {
        setIngredients(res.data);
      }
    } catch (err) {
      console.error('Failed to load ingredients', err);
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
        unit: form.unit,
        minStockLevel: Number(form.minStockLevel),
        costPerUnit: Number(form.unitCost),
        unitCost: Number(form.unitCost),
      };
      const res = await createIngredient(payload);
      if (res.success) {
        setIngredients([...ingredients, res.data]);
        setModal(false);
        setForm({ name: '', category: 'Produce', currentStock: 10, unit: 'kg', minStockLevel: 5, unitCost: 5 });
      } else {
        setErrorMsg(res.message || 'Failed to add ingredient');
      }
    } catch (err) {
      console.error('Failed to create ingredient', err);
      setErrorMsg(err.response?.data?.message || 'Error creating ingredient');
    }
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingredient Management</h1>
            <p className="text-slate-400 text-sm">Raw ingredients inventory, unit costs & reorder thresholds</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer">+ Add Ingredient</button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Ingredient</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Reorder Level</th>
                  <th className="px-6 py-4">Unit Cost</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading ingredients...</td>
                  </tr>
                ) : ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No ingredients found.</td>
                  </tr>
                ) : (
                  ingredients.map((ing) => {
                    const currentStock = ing.currentStock ?? ing.stock ?? 0;
                    const minStockLevel = ing.minStockLevel ?? ing.reorderLevel ?? 0;
                    const isLow = currentStock <= minStockLevel;
                    return (
                      <tr key={ing.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{ing.name}</td>
                        <td className="px-6 py-4 text-xs"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{ing.category || 'General'}</span></td>
                        <td className="px-6 py-4 font-mono font-semibold text-white">{currentStock} {ing.unit}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">{minStockLevel} {ing.unit}</td>
                        <td className="px-6 py-4 font-mono text-emerald-400">₹{Number(ing.costPerUnit ?? ing.unitCost ?? 0).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${isLow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                            {isLow ? 'Low Stock' : 'Optimal'}
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
              <h3 className="text-lg font-bold text-white">Add Ingredient</h3>
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-3">
                <input type="text" required placeholder="Ingredient Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Current Stock" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="text" required placeholder="Unit (kg, liters)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Reorder Level" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="number" step="0.01" required placeholder="Unit Cost (₹)" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
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
