import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { FiShieldOff, FiArrowLeft } from 'react-icons/fi';

export default function Unauthorized() {
  return (
    <Layout>
      <div className="w-full max-w-md my-auto text-center">
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-8 backdrop-blur-xl space-y-6 transition-colors">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60 flex items-center justify-center text-2xl shadow-xs">
            <FiShieldOff className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">403 - Access Denied</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
              You do not have permission to access this page with your current account role.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs text-left">
            <span className="font-semibold text-slate-900 dark:text-slate-200">Security Clearance Notice:</span> Contact your system administrator or manager if you believe you should have access.
          </div>
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all text-center cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}


