import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuthStore';

export default function ProtectedRoute({ allowedRoles }) {
  const user = useAuth((state) => state.user);
  const loading = useAuth((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-300">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Authenticating session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}


