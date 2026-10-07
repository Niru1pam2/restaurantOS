import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../store/useAuthStore";

const INITIAL = [
  {
    id: 1,
    number: "T-01",
    capacity: 2,
    status: "Occupied",
    waiter: "Alex R.",
    zone: "Indoor",
  },
  {
    id: 2,
    number: "T-02",
    capacity: 4,
    status: "Available",
    waiter: "Alex R.",
    zone: "Indoor",
  },
  {
    id: 3,
    number: "T-03",
    capacity: 6,
    status: "Reserved",
    waiter: "Sarah C.",
    zone: "Patio",
  },
  {
    id: 4,
    number: "T-04",
    capacity: 2,
    status: "Occupied",
    waiter: "Sarah C.",
    zone: "Patio",
  },
  {
    id: 5,
    number: "T-05",
    capacity: 4,
    status: "Cleaning",
    waiter: "Carlos M.",
    zone: "Indoor",
  },
];

const BADGES = {
  Available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Occupied: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  Reserved: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Cleaning: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export default function TableManagement() {
  const [tables, setTables] = useState(INITIAL);
  const [filter, setFilter] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    number: "",
    capacity: 4,
    zone: "Indoor",
    waiter: "Staff",
  });
  const user = useAuth((s) => s.user);

  const filtered =
    filter === "ALL" ? tables : tables.filter((t) => t.status === filter);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Table Management</h1>
            <p className="text-slate-400 text-sm">
              Live seating and status tracking
            </p>
          </div>
          {["OWNER", "MANAGER"].includes(user?.role) && (
            <button
              onClick={() => setModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
            >
              + Add Table
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-xl font-bold text-white">
              {tables.length}
            </span>
          </div>
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between">
            <span className="text-emerald-400 text-sm">Available</span>
            <span className="text-xl font-bold text-emerald-400">
              {tables.filter((t) => t.status === "Available").length}
            </span>
          </div>
          <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/20 flex justify-between">
            <span className="text-rose-400 text-sm">Occupied</span>
            <span className="text-xl font-bold text-rose-400">
              {tables.filter((t) => t.status === "Occupied").length}
            </span>
          </div>
          <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/20 flex justify-between">
            <span className="text-amber-400 text-sm">Reserved</span>
            <span className="text-xl font-bold text-amber-400">
              {tables.filter((t) => t.status === "Reserved").length}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL", "Available", "Occupied", "Reserved", "Cleaning"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${filter === st ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}
              >
                {st}
              </button>
            ),
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-white">
                    {t.number}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${BADGES[t.status]}`}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <p>
                    <span className="text-slate-400">Capacity:</span>{" "}
                    {t.capacity} Guests
                  </p>
                  <p>
                    <span className="text-slate-400">Zone:</span> {t.zone}
                  </p>
                  <p>
                    <span className="text-slate-400">Waiter:</span> {t.waiter}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <select
                  value={t.status}
                  onChange={(e) =>
                    setTables(
                      tables.map((item) =>
                        item.id === t.id
                          ? { ...item, status: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Table</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTables([
                    ...tables,
                    {
                      ...form,
                      id: Date.now(),
                      capacity: Number(form.capacity),
                      status: "Available",
                    },
                  ]);
                  setModal(false);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Table Number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Capacity"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
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
                    Save
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
