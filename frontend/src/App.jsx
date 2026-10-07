import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TableManagement from './pages/TableManagement';
import OrderManagement from './pages/OrderManagement';
import MenuManagement from './pages/MenuManagement';
import RecipeManagement from './pages/RecipeManagement';
import IngredientManagement from './pages/IngredientManagement';
import SupplierManagement from './pages/SupplierManagement';
import StaffManagement from './pages/StaffManagement';
import InventoryManagement from './pages/InventoryManagement';
import StockTransactions from './pages/StockTransactions';
import PurchaseOrders from './pages/PurchaseOrders';
import ExpenseManagement from './pages/ExpenseManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Unauthenticated Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
        </Route>

        {/* Role Restricted Routes */}
        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CHEF']} />}>
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/recipes" element={<RecipeManagement />} />
          <Route path="/ingredients" element={<IngredientManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/stock-transactions" element={<StockTransactions />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']} />}>
          <Route path="/suppliers" element={<SupplierManagement />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CASHIER']} />}>
          <Route path="/expenses" element={<ExpenseManagement />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default Fallback Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;





