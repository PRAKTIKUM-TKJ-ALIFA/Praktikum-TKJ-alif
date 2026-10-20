import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ParkingSquare, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      admin: { email: 'admin@parksmart.id', password: 'password' },
      operator: { email: 'operator@parksmart.id', password: 'password' },
      user: { email: 'user@parksmart.id', password: 'password' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 glow-primary">
            <ParkingSquare size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-dark-50 font-heading">ParkSmart</h1>
          <p className="text-dark-400 mt-1">Sistem Manajemen Parkir</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-dark-100 mb-6">Masuk ke Akun</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-dark-700">
            <p className="text-xs text-dark-500 text-center mb-3">Demo Akun (klik untuk isi otomatis)</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'operator', 'user'].map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="text-xs py-1.5 px-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-100 transition-all capitalize border border-dark-600"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-dark-500 mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
