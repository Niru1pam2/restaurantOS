import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_STAFF = [
  { id: 1, name: 'Elena Rostova', email: 'owner@restaurant.com', role: 'OWNER', shift: 'Full Time', status: 'Active' },
  { id: 2, name: 'Marcus Vance', email: 'manager@restaurant.com', role: 'MANAGER', shift: 'Morning Shift', status: 'Active' },
  { id: 3, name: 'Gordon Ramsay', email: 'chef@restaurant.com', role: 'CHEF', shift: 'Evening Shift', status: 'On Leave' },
  { id: 4, name: 'Alex Rivers', email: 'waiter@restaurant.com', role: 'WAITER', shift: 'Morning Shift', status: 'Active' },
  { id: 5, name: 'Sophia Taylor', email: 'cashier@restaurant.com', role: 'CASHIER', shift: 'Evening Shift', status: 'Active' },
];

const ROLE_BADGES = {
  OWNER: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  MANAGER: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  CHEF: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  WAITER: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  CASHIER: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
};

export default function StaffManagement() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'WAITER', shift: 'Morning Shift' });
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Staff & Personnel Management</h1>
            <p className="text-slate-400 text-sm">Role assignments, shift schedules & employee status</p>
          </div>
          {['OWNER', 'MANAGER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Add Staff Member</button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staff.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{st.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{st.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${ROLE_BADGES[st.role]}`}>
                        {st.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">{st.shift}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${st.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                        {st.status}
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
              <h3 className="text-lg font-bold text-white">Add Staff Member</h3>
              <form onSubmit={(e) => { e.preventDefault(); setStaff([...staff, { id: Date.now(), name: form.name, email: form.email, role: form.role, shift: form.shift, status: 'Active' }]); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="email" required placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="MANAGER">MANAGER</option>
                  <option value="CHEF">CHEF</option>
                  <option value="WAITER">WAITER</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Save Staff</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
