import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getOrders, createOrder, updateOrderStatus, completePayment } from '../api/orders.api';
import { getTables } from '../api/tables.api';
import { getMenuItems } from '../api/menu.api';

const BADGES = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PREPARING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  READY: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  SERVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-slate-700 text-slate-300 border-slate-600',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Create Order Form state
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedItems, setSelectedItems] = useState({}); // { menuItemId: quantity }
  const [orderNotes, setOrderNotes] = useState('');
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOrders, resTables, resMenu] = await Promise.all([
        getOrders().catch(() => ({ success: false })),
        getTables().catch(() => ({ success: false })),
        getMenuItems().catch(() => ({ success: false })),
      ]);
      if (resOrders.success) setOrders(resOrders.data);
      if (resTables.success) setTables(resTables.data);
      if (resMenu.success) setMenuItems(resMenu.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleItemQtyChange = (menuItemId, change) => {
    setSelectedItems((prev) => {
      const current = prev[menuItemId] || 0;
      const updated = current + change;
      if (updated <= 0) {
        const next = { ...prev };
        delete next[menuItemId];
        return next;
      }
      return { ...prev, [menuItemId]: updated };
    });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const items = Object.entries(selectedItems).map(([menuItemId, quantity]) => ({
      menuItemId: Number(menuItemId),
      quantity: Number(quantity),
    }));

    if (items.length === 0) {
      setErrorMsg('Please select at least one menu item.');
      return;
    }

    try {
      const payload = {
        tableId: selectedTableId ? Number(selectedTableId) : null,
        items,
        notes: orderNotes || undefined,
      };

      const res = await createOrder(payload);
      if (res.success) {
        setOrders([res.data, ...orders]);
        setModal(false);
        setSelectedTableId('');
        setSelectedItems({});
        setOrderNotes('');
        // Refresh tables if table was occupied
        getTables().then((tRes) => tRes.success && setTables(tRes.data));
      } else {
        setErrorMsg(res.message || 'Failed to create order');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error creating order');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      if (status === 'COMPLETED') {
        const res = await completePayment(id, { paymentMethod: 'CASH', discount: 0 });
        if (res.success) setOrders(orders.map(o => o.id === id ? res.data : o));
      } else {
        const res = await updateOrderStatus(id, status);
        if (res.success) setOrders(orders.map(o => o.id === id ? res.data : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Order Management</h1>
            <p className="text-slate-400 text-sm">Track active kitchen orders and customer billing</p>
          </div>
          {['OWNER', 'MANAGER', 'WAITER', 'CASHIER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Create Order</button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between"><span className="text-slate-400 text-sm">Active Orders</span><span className="text-xl font-bold text-white">{orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}</span></div>
          <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-500/20 flex justify-between"><span className="text-blue-400 text-sm">Preparing</span><span className="text-xl font-bold text-blue-400">{orders.filter(o => o.status === 'PREPARING').length}</span></div>
          <div className="bg-purple-950/20 p-4 rounded-xl border border-purple-500/20 flex justify-between"><span className="text-purple-400 text-sm">Ready</span><span className="text-xl font-bold text-purple-400">{orders.filter(o => o.status === 'READY').length}</span></div>
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between"><span className="text-emerald-400 text-sm">Served</span><span className="text-xl font-bold text-emerald-400">{orders.filter(o => o.status === 'SERVED').length}</span></div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button key={st} onClick={() => setFilter(st)} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${filter === st ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{st}</button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No orders found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((o) => (
              <div key={o.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-400">{o.orderNumber || `ORD-#${o.id}`}</span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">{o.table ? `Table ${o.table.tableNumber || o.table.number}` : 'Takeaway'}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${BADGES[o.status] || BADGES.PENDING}`}>{o.status}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Ordered Items:</span>
                    <ul className="text-sm text-slate-200 list-disc list-inside">
                      {o.items && o.items.length > 0 ? (
                        o.items.map((it, idx) => (
                          <li key={idx}>{it.menuItem?.name || `Item #${it.menuItemId}`} x{it.quantity}</li>
                        ))
                      ) : (
                        <li className="text-slate-500 text-xs">No item list</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Total: </span>
                    <span className="text-base font-bold text-white">₹{Number(o.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white">
                    <option value="PENDING">PENDING</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="READY">READY</option>
                    <option value="SERVED">SERVED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Create New Order</h3>
                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Seating Table (Optional for Takeaway)</label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="">Takeaway / Walk-in</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber || t.number} ({t.capacity} seats) - {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Select Menu Items</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {menuItems.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No menu items available. Create menu items first.</p>
                    ) : (
                      menuItems.map((m) => {
                        const qty = selectedItems[m.id] || 0;
                        return (
                          <div key={m.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div>
                              <span className="text-sm font-semibold text-white">{m.name}</span>
                              <span className="block text-xs text-indigo-400 font-mono">₹{Number(m.price).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(m.id, -1)}
                                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm cursor-pointer"
                                >
                                  -
                                </button>
                              )}
                              {qty > 0 && <span className="text-sm font-bold text-white w-4 text-center">{qty}</span>}
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(m.id, 1)}
                                className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Special Order Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, allergy details..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Estimated Total:</span>
                    <span className="block text-lg font-bold text-emerald-400 font-mono">
                      ₹{Object.entries(selectedItems).reduce((sum, [id, q]) => {
                        const item = menuItems.find((m) => m.id === Number(id));
                        return sum + (item ? item.price * q : 0);
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                    >
                      Submit Order
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
