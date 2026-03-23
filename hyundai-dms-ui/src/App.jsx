import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DealerManagement from './pages/admin/DealerManagement';
import CarCatalogue from './pages/admin/CarCatalogue';
import InventoryManagement from './pages/admin/InventoryManagement';
import AdminStockRequests from './pages/admin/StockRequests'; // ✅ ADDED
import DealerDashboard from './pages/dealer/Dashboard';
import DealerInventory from './pages/dealer/Inventory';
import DealerStockRequest from './pages/dealer/StockRequest'; // ✅ ADDED
import DealerLeads from './pages/dealer/Leads'; // ✅ NEW IMPORT
import ProtectedRoute from './components/ProtectedRoute';
import DealerBookings from './pages/dealer/Bookings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="ROLE_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dealers" element={
          <ProtectedRoute role="ROLE_ADMIN">
            <DealerManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/cars" element={
          <ProtectedRoute role="ROLE_ADMIN">
            <CarCatalogue />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute role="ROLE_ADMIN">
            <InventoryManagement />
          </ProtectedRoute>
        } />

        {/* ✅ NEW ADMIN ROUTE ADDED */}
        <Route path="/admin/stock-requests" element={
          <ProtectedRoute role="ROLE_ADMIN">
            <AdminStockRequests />
          </ProtectedRoute>
        } />

        {/* Dealer Routes */}
        <Route path="/dealer/dashboard" element={
          <ProtectedRoute role="ROLE_DEALER">
            <DealerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dealer/inventory" element={
          <ProtectedRoute role="ROLE_DEALER">
            <DealerInventory />
          </ProtectedRoute>
        } />

        {/* ✅ STOCK REQUEST ROUTE */}
        <Route path="/dealer/stock-requests" element={
          <ProtectedRoute role="ROLE_DEALER">
            <DealerStockRequest />
          </ProtectedRoute>
        } />

        {/* ✅ NEW LEADS ROUTE */}
        <Route path="/dealer/leads" element={
          <ProtectedRoute role="ROLE_DEALER">
            <DealerLeads />
          </ProtectedRoute>
        } />

        <Route path="/dealer/bookings" element={
    <ProtectedRoute role="ROLE_DEALER">
        <DealerBookings />
    </ProtectedRoute>
} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;