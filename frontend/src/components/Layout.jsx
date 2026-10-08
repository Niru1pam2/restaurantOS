import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../store/useAuthStore";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useAuth((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-slate-900 selection:text-white dark:selection:bg-slate-200 dark:selection:text-slate-900">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-start">
            {children}
          </main>

          <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xs py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                &copy; {new Date().getFullYear()} RestaurantOS. All rights reserved.
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Simple & Elegant Restaurant Management System
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

