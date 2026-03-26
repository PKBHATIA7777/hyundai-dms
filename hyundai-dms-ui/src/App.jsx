import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard      from './pages/admin/Dashboard';
import DealerManagement    from './pages/admin/DealerManagement';
import CarCatalogue        from './pages/admin/CarCatalogue';
import InventoryManagement from './pages/admin/InventoryManagement';
import AdminStockRequests  from './pages/admin/StockRequests';
import AdminCustomers      from './pages/admin/Customers';

// Dealer Pages
import DealerDashboard    from './pages/dealer/Dashboard';
import DealerInventory    from './pages/dealer/Inventory';
import DealerStockRequest from './pages/dealer/StockRequest';
import DealerLeads        from './pages/dealer/Leads';
import DealerBookings     from './pages/dealer/Bookings';
import DealerSales        from './pages/dealer/Sales';
import DealerEmployees    from './pages/dealer/Employees';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ── Admin Routes ── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/dealers" element={
          <ProtectedRoute role="ROLE_ADMIN"><DealerManagement /></ProtectedRoute>
        } />
        <Route path="/admin/cars" element={
          <ProtectedRoute role="ROLE_ADMIN"><CarCatalogue /></ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute role="ROLE_ADMIN"><InventoryManagement /></ProtectedRoute>
        } />
        <Route path="/admin/stock-requests" element={
          <ProtectedRoute role="ROLE_ADMIN"><AdminStockRequests /></ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute role="ROLE_ADMIN"><AdminCustomers /></ProtectedRoute>
        } />

        {/* ── Dealer Routes ── */}
        <Route path="/dealer/dashboard" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerDashboard /></ProtectedRoute>
        } />
        <Route path="/dealer/inventory" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerInventory /></ProtectedRoute>
        } />
        <Route path="/dealer/stock-requests" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerStockRequest /></ProtectedRoute>
        } />
        <Route path="/dealer/leads" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerLeads /></ProtectedRoute>
        } />
        <Route path="/dealer/bookings" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerBookings /></ProtectedRoute>
        } />
        <Route path="/dealer/sales" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerSales /></ProtectedRoute>
        } />
        <Route path="/dealer/employees" element={
          <ProtectedRoute role="ROLE_DEALER"><DealerEmployees /></ProtectedRoute>
        } />

        {/* Default */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;