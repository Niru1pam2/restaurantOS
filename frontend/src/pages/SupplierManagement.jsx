import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';
import { getSuppliers, createSupplier } from '../api/suppliers.api';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', email: '', category: 'Produce', leadTimeDays: 2 });
  const user = useAuth((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getSuppliers();
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        category: form.category,
        leadTimeDays: Number(form.leadTimeDays) || 2,
      };
      const res = await createSupplier(payload);
      if (res.success) {
        setSuppliers([...suppliers, res.data]);
        setModal(false);
        setForm({ name: '', contactPerson: '', phone: '', email: '', category: 'Produce', leadTimeDays: 2 });
      }
    } catch (err) {
      console.error('Failed to create supplier', err);
    }
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Supplier Management</h1>
            <p className="text-slate-400 text-sm">Vendor contacts, supply categories & lead time metrics</p>
          </div>
          {['OWNER', 'MANAGER'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ Add Supplier</button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No suppliers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{sup.name}</h3>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-md mt-1 inline-block">{sup.category || 'General'}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p><span className="text-slate-400">Contact Person:</span> {sup.contactPerson || sup.contact || 'N/A'}</p>
                  {sup.phone && <p><span className="text-slate-400">Phone:</span> {sup.phone}</p>}
                  {sup.email && <p><span className="text-slate-400">Email:</span> {sup.email}</p>}
                  <p><span className="text-slate-400">Average Lead Time:</span> {sup.leadTimeDays ? `${sup.leadTimeDays} Days` : (sup.leadTime || '2 Days')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Add New Supplier</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input type="text" required placeholder="Supplier Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" placeholder="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                  <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <input type="text" placeholder="Category (e.g. Seafood)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer">Save Supplier</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
