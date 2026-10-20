import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CheckInPage from './pages/CheckInPage';
import CheckOutPage from './pages/CheckOutPage';
import SlotMapPage from './pages/SlotMapPage';
import TransactionsPage from './pages/TransactionsPage';
import TariffPage from './pages/TariffPage';
import UserPortalPage from './pages/UserPortalPage';
import UsersPage from './pages/UsersPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/checkin" element={
          <ProtectedRoute roles={['admin', 'operator']}><CheckInPage /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute roles={['admin', 'operator']}><CheckOutPage /></ProtectedRoute>
        } />
        <Route path="/slots" element={
          <ProtectedRoute roles={['admin', 'operator']}><SlotMapPage /></ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute roles={['admin', 'operator']}><TransactionsPage /></ProtectedRoute>
        } />
        <Route path="/tariffs" element={
          <ProtectedRoute roles={['admin']}><TariffPage /></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>
        } />
        <Route path="/portal" element={<UserPortalPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
