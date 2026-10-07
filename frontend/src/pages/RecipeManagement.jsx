import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getRecipes, createRecipe, deleteRecipeItem } from '../api/recipes.api';
import { getMenuItems } from '../api/menu.api';
import { getIngredients } from '../api/ingredients.api';

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ menuItemId: '', ingredientId: '', quantityRequired: '', unit: 'kg' });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecipes, resMenu, resIng] = await Promise.all([
        getRecipes().catch(() => ({ success: false })),
        getMenuItems().catch(() => ({ success: false })),
        getIngredients().catch(() => ({ success: false })),
      ]);
      if (resRecipes.success) setRecipes(resRecipes.data);
      if (resMenu.success) setMenuItems(resMenu.data);
      if (resIng.success) setIngredients(resIng.data);
    } catch (err) {
      console.error('Failed to load recipe data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        menuItemId: Number(form.menuItemId),
        ingredientId: Number(form.ingredientId),
        quantityRequired: Number(form.quantityRequired),
        unit: form.unit,
      };
      const res = await createRecipe(payload);
      if (res.success) {
        // Refresh recipes list
        fetchData();
        setModal(false);
        setForm({ menuItemId: '', ingredientId: '', quantityRequired: '', unit: 'kg' });
      } else {
        setErrorMsg(res.message || 'Failed to add recipe item');
      }
    } catch (err) {
      console.error('Failed to create recipe', err);
      setErrorMsg(err.response?.data?.message || 'Error creating recipe item');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteRecipeItem(id);
      if (res.success) {
        setRecipes(recipes.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Recipe Management</h1>
            <p className="text-slate-400 text-sm">Standardized culinary recipes, ingredient ratios & kitchen prep instructions</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer">+ New Recipe</button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No recipe ingredients found. Click "+ New Recipe" to link ingredients to menu items.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-bold text-lg text-white">{r.menuItem?.name || `Menu Item #${r.menuItemId}`}</h3>
                      <span className="text-xs text-emerald-400 font-mono">${Number(r.menuItem?.price || 0).toFixed(2)}</span>
                    </div>
                    {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
                      <button onClick={() => handleDelete(r.id)} className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-300">{r.ingredient?.name || `Ingredient #${r.ingredientId}`}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Required: {r.quantityRequired} {r.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Cost/Unit</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          ${Number(r.ingredient?.costPerUnit || r.ingredient?.unitCost || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Recipe Ingredient</h3>
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Select Menu Item</label>
                  <select
                    required
                    value={form.menuItemId}
                    onChange={(e) => setForm({ ...form, menuItemId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select a dish...</option>
                    {menuItems.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (${Number(m.price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Select Ingredient</label>
                  <select
                    required
                    value={form.ingredientId}
                    onChange={(e) => setForm({ ...form, ingredientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select ingredient...</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Qty Required</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 0.25"
                      value={form.quantityRequired}
                      onChange={(e) => setForm({ ...form, quantityRequired: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="kg, liters, pcs"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Save Recipe Item</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
