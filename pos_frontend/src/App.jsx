import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Bookings from './pages/admin/Bookings';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import PaymentMethods from './pages/admin/PaymentMethods';
import Floors from './pages/admin/Floors';
import Reports from './pages/admin/Reports';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';
import StaffOrders from './pages/staff/StaffOrders';
import StaffPayment from './pages/staff/StaffPayment';
import Receipt from './pages/staff/Receipt';

function AdminLayout({ children }) {
  return (<><Navbar /><div>{children}</div></>);
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#fff', color: '#334155', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' } }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Admin/Manager Portal */}
          <Route path="/admin-portal/dashboard" element={<ProtectedRoute role="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin-portal/products" element={<ProtectedRoute role="admin"><AdminLayout><Products /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin-portal/categories" element={<ProtectedRoute role="admin"><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin-portal/payment-methods" element={<ProtectedRoute role="admin"><AdminLayout><PaymentMethods /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin-portal/floors" element={<ProtectedRoute role="admin"><AdminLayout><Floors /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin-portal/reports" element={<ProtectedRoute role="admin"><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin-portal/bookings" element={<ProtectedRoute role="admin"><AdminLayout><Bookings /></AdminLayout></ProtectedRoute>} />

          {/* Staff Portal */}
          <Route path="/staff/orders" element={<ProtectedRoute role="staff"><StaffOrders /></ProtectedRoute>} />
          <Route path="/staff/payment/:orderId" element={<ProtectedRoute role="staff"><StaffPayment /></ProtectedRoute>} />
          <Route path="/staff/receipt/:orderId" element={<ProtectedRoute role="staff"><Receipt /></ProtectedRoute>} />

          {/* Kitchen Portal */}
          <Route path="/kitchen/display" element={<ProtectedRoute role="kitchen"><KitchenDisplay /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
