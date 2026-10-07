import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../store/useAuthStore";

const INITIAL_MENU = [
  {
    id: 1,
    name: "Truffle Mushroom Risotto",
    category: "Mains",
    price: 24.5,
    available: true,
    prepTime: "20m",
    ingredients: ["Arborio Rice", "Truffle Oil", "Mushrooms", "Parmesan"],
  },
  {
    id: 2,
    name: "Wagyu Beef Burger",
    category: "Mains",
    price: 19.0,
    available: true,
    prepTime: "15m",
    ingredients: ["Wagyu Patty", "Brioche Bun", "Cheddar", "Caramelized Onion"],
  },
  {
    id: 3,
    name: "Crispy Calamari",
    category: "Appetizers",
    price: 14.0,
    available: true,
    prepTime: "10m",
    ingredients: ["Squid", "Garlic Aioli", "Lemon", "Herbs"],
  },
  {
    id: 4,
    name: "Artisan Tiramisu",
    category: "Desserts",
    price: 9.5,
    available: true,
    prepTime: "5m",
    ingredients: ["Mascarpone", "Espresso", "Ladyfingers", "Cocoa"],
  },
  {
    id: 5,
    name: "Signature Red Blend Wine",
    category: "Beverages",
    price: 12.0,
    available: false,
    prepTime: "2m",
    ingredients: ["Cabernet Sauvignon"],
  },
];

export default function MenuManagement() {
  const [items, setItems] = useState(INITIAL_MENU);
  const [category, setCategory] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Mains",
    price: "",
    prepTime: "15m",
    ingredients: "",
  });
  const user = useAuth((s) => s.user);

  const filtered = category === "ALL" ? items : items.filter((i) => i.category === category);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Menu Management
            </h1>
            <p className="text-slate-400 text-sm">
              Configure dishes, pricing, and ingredients
            </p>
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
          {["ALL", "Appetizers", "Mains", "Desserts", "Beverages"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${category === c ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-white">
                    {item.name}
                  </h3>
                  <span className="text-sm font-extrabold text-indigo-400">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {item.category}
                </span>
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Prep: {item.prepTime}
                </span>
                <button
                  onClick={() =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id
                          ? { ...i, available: !i.available }
                          : i,
                      ),
                    )
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${item.available ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}
                >
                  {item.available ? "In Stock" : "Sold Out"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Menu Item</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setItems([
                    ...items,
                    {
                      id: Date.now(),
                      name: form.name,
                      category: form.category,
                      price: Number(form.price) || 10,
                      available: true,
                      prepTime: form.prepTime,
                      ingredients: form.ingredients.split(","),
                    },
                  ]);
                  setModal(false);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Item Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="Appetizers">Appetizers</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Price ($)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Ingredients (comma separated)"
                  value={form.ingredients}
                  onChange={(e) =>
                    setForm({ ...form, ingredients: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
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
