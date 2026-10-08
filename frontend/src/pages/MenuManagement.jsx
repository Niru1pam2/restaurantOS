import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../store/useAuthStore";
import { getMenuItems, createMenuItem, updateMenuItemAvailability } from "../api/menu.api";
import { getCategories } from "../api/categories.api";

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    description: "",
    prepTimeMinutes: 15,
  });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([getMenuItems(), getCategories()]);
      if (menuRes.success) setItems(menuRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to load menu data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id, currentAvailability) => {
    try {
      const res = await updateMenuItemAvailability(id, !currentAvailability);
      if (res.success) {
        setItems(items.map((i) => (i.id === id ? { ...i, isAvailable: !currentAvailability } : i)));
      }
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        price: Number(form.price),
        description: form.description,
        prepTimeMinutes: Number(form.prepTimeMinutes) || 15,
      };
      const res = await createMenuItem(payload);
      if (res.success) {
        setItems([...items, res.data]);
        setModal(false);
        setForm({ name: "", categoryId: "", price: "", description: "", prepTimeMinutes: 15 });
      }
    } catch (err) {
      console.error("Failed to create menu item", err);
    }
  };

  const filtered = selectedCategory === "ALL" 
    ? items 
    : items.filter((i) => i.categoryId === Number(selectedCategory) || i.category?.name === selectedCategory);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Menu Management</h1>
            <p className="text-slate-400 text-sm">Configure dishes, pricing, and ingredients</p>
          </div>
          {["OWNER", "MANAGER", "CHEF"].includes(user?.role) && (
            <button
              onClick={() => setModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
            >
              + Add Item
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${selectedCategory === "ALL" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            ALL
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${selectedCategory === c.id ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading menu items...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No menu items found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold text-white">{item.name}</h3>
                    <span className="text-sm font-extrabold text-indigo-400">₹{Number(item.price || 0).toFixed(2)}</span>
                  </div>
                  {item.category && (
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 mt-1 inline-block">
                      {item.category.name}
                    </span>
                  )}
                  {item.description && (
                    <p className="mt-2 text-xs text-slate-400">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Prep: {item.prepTimeMinutes || 15}m
                  </span>
                  <button
                    onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${item.isAvailable ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}
                  >
                    {item.isAvailable ? "In Stock" : "Sold Out"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Menu Item</h3>
              <form onSubmit={handleCreateItem} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Item Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Price (₹)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
