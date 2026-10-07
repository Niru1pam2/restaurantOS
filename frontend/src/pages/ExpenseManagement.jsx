import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_EXPENSES = [
  { id: 1, title: 'Monthly Store Rent', category: 'Rent & Facilities', amount: 4500.00, date: '2026-10-01', vendor: 'City Plaza Properties', status: 'Paid' },
  { id: 2, title: 'Fresh Produce Invoices', category: 'Raw Materials', amount: 1240.50, date: '2026-10-04', vendor: 'Fresh Farms Direct', status: 'Paid' },
  { id: 3, title: 'Electricity & Gas Utilities', category: 'Utilities', amount: 890.20, date: '2026-10-05', vendor: 'Metropolitan Energy', status: 'Pending' },
  { id: 4, title: 'Staff Payroll - Week 40', category: 'Payroll', amount: 6200.00, date: '2026-10-06', vendor: 'Internal Staff', status: 'Paid' },
];

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Raw Materials', amount: '', vendor: '' });
  const user = useAuth((s) => s.user);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

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
            <span className="text-slate-400 text-sm">Total Expenses (Oct)</span>
            <span className="text-xl font-bold text-rose-400">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-400 text-sm">Total Paid</span>
            <span className="text-xl font-bold text-emerald-400">${expenses.filter(e => e.status === 'Paid').reduce((a, c) => a + c.amount, 0).toFixed(2)}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-400 text-sm">Pending Approval</span>
            <span className="text-xl font-bold text-amber-400">${expenses.filter(e => e.status === 'Pending').reduce((a, c) => a + c.amount, 0).toFixed(2)}</span>
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
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{e.title}</td>
                    <td className="px-6 py-4 text-xs"><span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">{e.category}</span></td>
                    <td className="px-6 py-4 text-xs text-indigo-300">{e.vendor}</td>
                    <td className="px-6 py-4 font-mono font-bold text-rose-400">${e.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{e.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${e.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Log Expense Record</h3>
              <form onSubmit={(ev) => { ev.preventDefault(); setExpenses([...expenses, { id: Date.now(), title: form.title, category: form.category, amount: Number(form.amount) || 0, date: '2026-10-07', vendor: form.vendor, status: 'Paid' }]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Description (e.g. Produce Delivery)" value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" required placeholder="Vendor Name" value={form.vendor} onChange={(ev) => setForm({ ...form, vendor: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="number" step="0.01" required placeholder="Amount ($)" value={form.amount} onChange={(ev) => setForm({ ...form, amount: ev.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Save Expense</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
