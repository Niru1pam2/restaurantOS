import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Unauthorized() {
  return (
    <Layout>
      <div className="w-full max-w-md my-auto text-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl font-bold text-red-400">
            !
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-red-400 tracking-tight">403 - Access Denied</h1>
            <p className="text-slate-400 text-sm mt-2">
              You do not have permission to access this restricted route with your current role.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs text-left">
            <span className="font-semibold text-slate-200">Role Restriction:</span> Access to this resource requires appropriate backend role clearance.
          </div>
          <Link
            to="/dashboard"
            className="inline-block w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
}


