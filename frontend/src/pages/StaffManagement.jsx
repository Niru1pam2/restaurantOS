import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../api/staff.api';

const ROLE_BADGES = {
  OWNER: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  MANAGER: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  CHEF: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  WAITER: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  CASHIER: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: 'Password123!', role: 'WAITER', shift: 'Morning Shift' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'WAITER', password: '' });

  const user = useAuth((s) => s.user);
  const isOwner = user?.role === 'OWNER';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getStaff();
      if (res.success) {
        setStaff(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        shift: form.shift,
      };
      const res = await createStaff(payload);
      if (res.success) {
        setStaff([...staff, res.data]);
        setModal(false);
        setForm({ name: '', email: '', password: 'Password123!', role: 'WAITER', shift: 'Morning Shift' });
      }
    } catch (err) {
      console.error('Failed to create staff member', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create staff member');
    }
  };

  const handleOpenEdit = (st) => {
    setEditingStaffId(st.id);
    setEditForm({
      name: st.name || '',
      email: st.email || '',
      role: st.role || 'WAITER',
      password: '',
    });
    setErrorMsg('');
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password && editForm.password.trim() !== '') {
        payload.password = editForm.password;
      }

      const res = await updateStaff(editingStaffId, payload);
      if (res.success) {
        setStaff(staff.map((s) => (s.id === editingStaffId ? res.data : s)));
        setEditModal(false);
        setEditingStaffId(null);
      }
    } catch (err) {
      console.error('Failed to update staff member', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update staff member');
    }
  };

  const handleDelete = async (st) => {
    if (st.id === user?.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${st.name}?`)) {
      return;
    }
    try {
      const res = await deleteStaff(st.id);
      if (res.success) {
        setStaff(staff.filter((s) => s.id !== st.id));
      }
    } catch (err) {
      console.error('Failed to delete staff member', err);
      alert(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Staff & Personnel Management</h1>
            <p className="text-slate-400 text-sm">Role assignments, shift schedules & employee status</p>
          </div>
          {['OWNER', 'MANAGER'].includes(user?.role) && (
            <button onClick={() => { setErrorMsg(''); setModal(true); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl cursor-pointer">+ Add Staff Member</button>
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
                  {isOwner && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={isOwner ? 6 : 5} className="px-6 py-8 text-center text-slate-400">Loading staff members...</td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={isOwner ? 6 : 5} className="px-6 py-8 text-center text-slate-500">No staff members found.</td>
                  </tr>
                ) : (
                  staff.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{st.name}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{st.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${ROLE_BADGES[st.role] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {st.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">{st.shift || 'Full Time'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${st.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                          {st.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(st)}
                            disabled={st.id === user?.id}
                            title={st.id === user?.id ? "Cannot delete yourself" : "Delete Staff"}
                            className={`px-3 py-1 border rounded-lg text-xs font-semibold ${
                              st.id === user?.id
                                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-700'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 cursor-pointer'
                            }`}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add Staff Member</h3>
              {errorMsg && <p className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{errorMsg}</p>}
              <form onSubmit={handleCreate} className="space-y-3">
                <input type="text" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="email" required placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="password" required placeholder="Initial Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="CHEF">CHEF</option>
                  <option value="WAITER">WAITER</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Save Staff</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Edit Staff Member</h3>
              {errorMsg && <p className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{errorMsg}</p>}
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                  <input type="text" required placeholder="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <input type="email" required placeholder="Email Address" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Role</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                    <option value="OWNER">OWNER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CHEF">CHEF</option>
                    <option value="WAITER">WAITER</option>
                    <option value="CASHIER">CASHIER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" placeholder="New Password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Update Staff</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
