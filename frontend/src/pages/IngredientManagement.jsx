import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_INGREDIENTS = [
  { id: 1, name: 'Arborio Rice', category: 'Dry Goods', stock: 45, unit: 'kg', reorderLevel: 20, unitCost: 3.50, supplier: 'AgriCorp Global' },
  { id: 2, name: 'Wagyu Beef Patty', category: 'Meat & Poultry', stock: 12, unit: 'kg', reorderLevel: 15, unitCost: 18.00, supplier: 'Prime Cut Meats' },
  { id: 3, name: 'Truffle Oil', category: 'Oils & Spices', stock: 5, unit: 'liters', reorderLevel: 8, unitCost: 28.00, supplier: 'Gourmet Imports' },
  { id: 4, name: 'Parmesan Cheese', category: 'Dairy', stock: 25, unit: 'kg', reorderLevel: 10, unitCost: 12.50, supplier: 'Dairy Fresh Co.' },
  { id: 5, name: 'Button Mushrooms', category: 'Produce', stock: 8, unit: 'kg', reorderLevel: 10, unitCost: 4.20, supplier: 'Fresh Farms Direct' },
];

export default function IngredientManagement() {
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Produce', stock: 10, unit: 'kg', reorderLevel: 5, unitCost: 5 });
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingredient Management</h1>
            <p className="text-slate-400 text-sm">Raw ingredients inventory, unit costs & reorder thresholds</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Add Ingredient</button>
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
                {ingredients.map((ing) => {
                  const isLow = ing.stock <= ing.reorderLevel;
                  return (
                    <tr key={ing.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{ing.name}</td>
                      <td className="px-6 py-4 text-xs"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{ing.category}</span></td>
                      <td className="px-6 py-4 font-mono font-semibold text-white">{ing.stock} {ing.unit}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{ing.reorderLevel} {ing.unit}</td>
                      <td className="px-6 py-4 font-mono text-emerald-400">${ing.unitCost.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${isLow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                          {isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Ingredient</h3>
              <form onSubmit={(e) => { e.preventDefault(); setIngredients([...ingredients, { id: Date.now(), name: form.name, category: form.category, stock: Number(form.stock), unit: form.unit, reorderLevel: Number(form.reorderLevel), unitCost: Number(form.unitCost), supplier: 'General Supplier' }]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Ingredient Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="text" required placeholder="Unit (kg, liters)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Reorder Level" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="number" step="0.01" required placeholder="Unit Cost ($)" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
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
