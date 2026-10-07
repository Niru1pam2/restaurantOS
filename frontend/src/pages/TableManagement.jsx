import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../store/useAuthStore";
import { getTables, createTable, updateTableStatus, deleteTable } from "../api/tables.api";

const BADGES = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  OCCUPIED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  RESERVED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  CLEANING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ number: "", capacity: 4, location: "Main Dining" });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    getTables()
      .then((res) => res.success && setTables(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateTableStatus(id, status);
      if (res.success) setTables(tables.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await createTable({
        tableNumber: form.number,
        capacity: Number(form.capacity),
        location: form.location,
      });
      if (res.success) {
        setTables([...tables, res.data]);
        setModal(false);
        setForm({ number: "", capacity: 4, location: "Main Dining" });
      } else {
        setErrorMsg(res.message || "Failed to create table");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error creating table");
    }
  };

  const handleDeleteTable = async (id, num) => {
    if (!window.confirm(`Are you sure you want to delete Table ${num}?`)) return;
    try {
      const res = await deleteTable(id);
      if (res.success) {
        setTables(tables.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete table:", err);
      alert(err.response?.data?.message || "Failed to delete table");
    }
  };

  const filtered = filter === "ALL" ? tables : tables.filter((t) => t.status === filter);

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
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between"><span className="text-slate-400 text-sm">Total</span><span className="text-xl font-bold text-white">{tables.length}</span></div>
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between"><span className="text-emerald-400 text-sm">Available</span><span className="text-xl font-bold text-emerald-400">{tables.filter((t) => t.status === "AVAILABLE").length}</span></div>
          <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/20 flex justify-between"><span className="text-rose-400 text-sm">Occupied</span><span className="text-xl font-bold text-rose-400">{tables.filter((t) => t.status === "OCCUPIED").length}</span></div>
          <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/20 flex justify-between"><span className="text-amber-400 text-sm">Reserved</span><span className="text-xl font-bold text-amber-400">{tables.filter((t) => t.status === "RESERVED").length}</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL", "AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"].map((st) => (
            <button key={st} onClick={() => setFilter(st)} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${filter === st ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}>
              {st}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading tables...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No tables found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-extrabold text-white">Table {t.tableNumber || t.number}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${BADGES[t.status] || BADGES.AVAILABLE}`}>{t.status}</span>
                      {["OWNER", "MANAGER"].includes(user?.role) && (
                        <button
                          onClick={() => handleDeleteTable(t.id, t.tableNumber || t.number)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                          title="Delete Table"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-300 space-y-1">
                    <p><span className="text-slate-400">Capacity:</span> {t.capacity} Seats</p>
                    <p><span className="text-slate-400">Location:</span> {t.location || "Indoor"}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white">
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="CLEANING">CLEANING</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Table</h3>
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleAddTable} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Table Number (e.g. T1, T2, 101)"
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
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Main Dining, Patio, Bar)"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
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
