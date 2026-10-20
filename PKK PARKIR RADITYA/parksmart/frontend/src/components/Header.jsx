import React from 'react';
import { Menu, Bell, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const now = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-dark-900 border-b border-dark-700 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-dark-400 hover:text-dark-200 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="hidden md:flex items-center gap-2 text-dark-500 text-sm">
          <Clock size={14} />
          <span>{now}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-dark-700">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <span className="text-primary-400 font-semibold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-dark-200 leading-none">{user?.name}</p>
            <p className="text-xs text-dark-500 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
