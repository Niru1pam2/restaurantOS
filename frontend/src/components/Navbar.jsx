import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuthStore";

const ROLE_COLORS = {
  OWNER: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  MANAGER: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  CHEF: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  WAITER: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  CASHIER: "bg-teal-500/20 text-teal-300 border-teal-500/40",
};

export default function Navbar() {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleStyle =
    ROLE_COLORS[user?.role] || "bg-slate-700 text-slate-200 border-slate-600";

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          <span className="text-2xl">🍽️</span>
          <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            RestaurantOS
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <span className="text-sm font-medium text-slate-200">
                  {user.name}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${roleStyle}`}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
