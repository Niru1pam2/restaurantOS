import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { FiSun, FiMoon, FiLogOut, FiMenu } from "react-icons/fi";
import { LuUtensils } from "react-icons/lu";

const ROLE_COLORS = {
  OWNER:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
  MANAGER:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  CHEF: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  WAITER:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  CASHIER:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
};

export default function Navbar({ onToggleSidebar }) {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleStyle =
    ROLE_COLORS[user?.role] ||
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-40 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <LuUtensils className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Restaurant
              <span className="text-indigo-600 dark:text-indigo-400">OS</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          >
            {theme === "light" ? (
              <FiMoon className="w-4 h-4 text-slate-700" />
            ) : (
              <FiSun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {user.name}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${roleStyle}`}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-300 dark:border-slate-700 dark:hover:border-rose-800/60 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
