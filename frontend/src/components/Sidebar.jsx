import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/useAuthStore";
import {
  FiHome,
  FiCpu,
  FiFileText,
  FiGrid,
  FiShoppingBag,
  FiBookOpen,
  FiBook,
  FiBox,
  FiLayers,
  FiActivity,
  FiTruck,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiX,
} from "react-icons/fi";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: FiHome, roles: ["OWNER", "MANAGER", "CHEF", "WAITER", "CASHIER"] },
  { path: "/ai-insights", label: "AI Insights", icon: FiCpu, roles: ["OWNER", "MANAGER", "CHEF"] },
  { path: "/invoices", label: "AI Invoices", icon: FiFileText, roles: ["OWNER", "MANAGER"] },
  { path: "/tables", label: "Tables", icon: FiGrid, roles: ["OWNER", "MANAGER", "CHEF", "WAITER", "CASHIER"] },
  { path: "/orders", label: "Orders", icon: FiShoppingBag, roles: ["OWNER", "MANAGER", "CHEF", "WAITER", "CASHIER"] },
  { path: "/menu", label: "Menu", icon: FiBookOpen, roles: ["OWNER", "MANAGER", "CHEF"] },
  { path: "/recipes", label: "Recipes", icon: FiBook, roles: ["OWNER", "MANAGER", "CHEF"] },
  { path: "/ingredients", label: "Ingredients", icon: FiBox, roles: ["OWNER", "MANAGER", "CHEF"] },
  { path: "/inventory", label: "Inventory", icon: FiLayers, roles: ["OWNER", "MANAGER", "CHEF"] },
  { path: "/stock-transactions", label: "Stock Logs", icon: FiActivity, roles: ["OWNER", "MANAGER", "CHEF"] },
  { path: "/suppliers", label: "Suppliers", icon: FiTruck, roles: ["OWNER", "MANAGER"] },
  { path: "/purchase-orders", label: "Purchase Orders", icon: FiShoppingCart, roles: ["OWNER", "MANAGER"] },
  { path: "/staff", label: "Staff", icon: FiUsers, roles: ["OWNER", "MANAGER"] },
  { path: "/expenses", label: "Expenses", icon: FiDollarSign, roles: ["OWNER", "MANAGER", "CASHIER"] },
  { path: "/reports", label: "Reports", icon: FiBarChart2, roles: ["OWNER", "MANAGER"] },
];
export default function Sidebar({ isOpen, onClose }) {
  const user = useAuth((state) => state.user);
  const location = useLocation();

  if (!user) return null;

  const visibleNavs = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Mobile-only Close Header */}
      <div className="md:hidden p-3 flex justify-end border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {visibleNavs.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-60 lg:w-64 shrink-0 h-[calc(100vh-3.6rem)] sticky top-[3.6rem] z-30">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}