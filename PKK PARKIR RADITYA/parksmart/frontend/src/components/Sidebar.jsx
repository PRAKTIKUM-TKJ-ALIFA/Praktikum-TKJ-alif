import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogIn, LogOut, Map, Receipt,
  Settings, Users, Car, X, ParkingSquare, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `sidebar-link ${isActive ? 'active' : ''}`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin, isAdminOrOperator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-dark-900 border-r border-dark-700
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center glow-primary">
            <ParkingSquare size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-dark-50 text-lg leading-none">ParkSmart</h1>
            <p className="text-xs text-dark-500 mt-0.5">Management System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-dark-400 hover:text-dark-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-dark-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <span className="text-primary-400 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
            <p className="text-xs text-dark-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-dark-600 uppercase tracking-wider px-4 mb-2">Menu Utama</p>

        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />

        {isAdminOrOperator && (
          <>
            <NavItem to="/checkin" icon={LogIn} label="Check-In" onClick={onClose} />
            <NavItem to="/checkout" icon={LogOut} label="Check-Out" onClick={onClose} />
            <NavItem to="/slots" icon={Map} label="Peta Slot" onClick={onClose} />
            <NavItem to="/transactions" icon={Receipt} label="Transaksi" onClick={onClose} />
          </>
        )}

        {isAdmin && (
          <>
            <div className="pt-3">
              <p className="text-xs font-semibold text-dark-600 uppercase tracking-wider px-4 mb-2">Admin</p>
            </div>
            <NavItem to="/tariffs" icon={Settings} label="Tarif" onClick={onClose} />
            <NavItem to="/users" icon={Users} label="Pengguna" onClick={onClose} />
          </>
        )}

        <div className="pt-3">
          <p className="text-xs font-semibold text-dark-600 uppercase tracking-wider px-4 mb-2">Akun</p>
        </div>
        <NavItem to="/portal" icon={User} label="Portal Saya" onClick={onClose} />
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-dark-700">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
