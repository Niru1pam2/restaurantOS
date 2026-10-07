import { useAuth } from "../store/useAuthStore";
import Layout from "../components/Layout";

const ROLE_BADGES = {
  OWNER: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  MANAGER: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  CHEF: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  WAITER: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  CASHIER: "bg-teal-500/20 text-teal-300 border-teal-500/40",
};

export default function Dashboard() {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);

  const roleBadgeStyle =
    ROLE_BADGES[user?.role] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <Layout>
      <div className="w-full max-w-4xl space-y-8">
        {/* Welcome Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome, {user?.name}!
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              You are authenticated with role{" "}
              <span
                className={`inline-block font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleBadgeStyle}`}
              >
                {user?.role}
              </span>
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-sm font-semibold transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Details Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              User Account Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Email Address</span>
                <span className="font-semibold text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned Role</span>
                <span
                  className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md border ${roleBadgeStyle}`}
                >
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">User ID</span>
                <span className="font-mono text-xs text-indigo-400">
                  #{user?.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
