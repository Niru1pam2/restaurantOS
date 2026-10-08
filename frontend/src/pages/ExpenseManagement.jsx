import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getExpenses, createExpense, getExpenseCategories } from '../api/expenses.api';

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ title: '', category: 'Raw Materials', amount: '', vendor: '', status: 'PAID' });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resExpenses, resCat] = await Promise.all([
        getExpenses().catch(() => ({ success: false })),
        getExpenseCategories().catch(() => ({ success: false })),
      ]);
      if (resExpenses.success) setExpenses(resExpenses.data);
      if (resCat.success) setCategories(resCat.data);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        title: form.title,
        category: form.category,
        amount: Number(form.amount) || 0,
        vendor: form.vendor,
        status: form.status,
      };
      const res = await createExpense(payload);
      if (res.success) {
        setExpenses([res.data, ...expenses]);
        setModal(false);
        setForm({ title: '', category: 'Raw Materials', amount: '', vendor: '', status: 'PAID' });
      } else {
        setErrorMsg(res.message || 'Failed to log expense');
      }
    } catch (err) {
      console.error('Failed to create expense', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error logging expense');
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = expenses.filter(e => e.status === 'Paid' || e.status === 'PAID').reduce((a, c) => a + Number(c.amount || 0), 0);
  const totalPending = expenses.filter(e => e.status === 'Pending' || e.status === 'PENDING').reduce((a, c) => a + Number(c.amount || 0), 0);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Expense Management</h1>
            <p className="text-slate-400 text-sm">Monthly expenditure records, supplier invoices & category breakdown</p>
          </div>
          {['OWNER', 'MANAGER', 'CASHIER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Log Expense</button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-400 text-sm">Total Expenses</span>
            <span className="text-xl font-bold text-rose-400">₹{totalSpent.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-400 text-sm">Total Paid</span>
            <span className="text-xl font-bold text-emerald-400">₹{totalPaid.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-400 text-sm">Pending Approval</span>
            <span className="text-xl font-bold text-amber-400">₹{totalPending.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title / Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading expenses...</td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No expense records found.</td>
                  </tr>
                ) : (
                  expenses.map((e) => {
                    const statusStr = e.status || 'PAID';
                    const isPaid = statusStr === 'PAID' || statusStr === 'Paid';
                    return (
                      <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{e.title || e.description}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                            {e.category?.name || (typeof e.category === 'string' ? e.category : null) || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-indigo-300">
                          {e.supplier?.name || e.vendor || (e.description?.startsWith('Vendor: ') ? e.description.replace('Vendor: ', '') : null) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-rose-400">₹{Number(e.amount || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : (e.date || 'N/A')}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                            {statusStr}
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
              <h3 className="text-lg font-bold text-white">Log Expense Record</h3>
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Expense Title / Description</label>
                  <input type="text" required placeholder="e.g. Produce Delivery" value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select value={form.category} onChange={(ev) => setForm({ ...form, category: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Raw Materials">Raw Materials</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Rent">Rent</option>
                        <option value="General">General</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Vendor / Supplier Name</label>
                  <input type="text" placeholder="Vendor Name" value={form.vendor} onChange={(ev) => setForm({ ...form, vendor: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (₹)</label>
                  <input type="number" step="0.01" required placeholder="Amount (₹)" value={form.amount} onChange={(ev) => setForm({ ...form, amount: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Status</label>
                  <select value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setModal(false); setErrorMsg(''); }} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Save Expense</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
