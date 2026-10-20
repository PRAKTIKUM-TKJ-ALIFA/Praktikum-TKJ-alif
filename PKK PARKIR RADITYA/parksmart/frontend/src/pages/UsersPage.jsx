import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { formatDate, roleConfig } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const UserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState(
    user || { name: '', email: '', password: '', role: 'user' }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user && !form.password) { toast.error('Password wajib diisi'); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h3 className="section-title">{user ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nama Lengkap *</label>
            <input className="input-field" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input-field" placeholder="email@domain.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">{user ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
            <input type="password" className="input-field" placeholder="Min. 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Role *</label>
            <select className="select-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              <Save size={14} />
              {user ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (form) => form.id
      ? api.put(`/users/${form.id}`, form)
      : api.post('/auth/register', form),
    onSuccess: () => { queryClient.invalidateQueries(['users']); toast.success('Pengguna disimpan'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['users']); toast.success('Pengguna dihapus'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="text-dark-400 text-sm mt-1">Kelola akun admin, operator, dan user</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary text-sm">
          <Plus size={14} />
          Tambah Pengguna
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="table-header text-left">Nama</th>
                <th className="table-header text-left">Email</th>
                <th className="table-header text-left">Role</th>
                <th className="table-header text-left">Bergabung</th>
                <th className="table-header text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="table-cell"><div className="h-4 skeleton rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-dark-500 py-12">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    Tidak ada pengguna
                  </td>
                </tr>
              ) : (
                users?.map(u => {
                  const role = roleConfig[u.role];
                  return (
                    <tr key={u.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-400 text-xs font-semibold">{u.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-dark-100">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="text-xs text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">Anda</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-dark-300">{u.email}</td>
                      <td className="table-cell">
                        <span className={`badge ${role?.className}`}>{role?.label}</span>
                      </td>
                      <td className="table-cell text-dark-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModal(u)}
                            className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => { if (window.confirm(`Hapus pengguna ${u.name}?`)) deleteMutation.mutate(u.id); }}
                              className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <UserModal
          user={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={(form) => saveMutation.mutateAsync(form)}
        />
      )}
    </div>
  );
}
