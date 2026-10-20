import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Car, History, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, formatDateTime, formatDuration, paymentStatusConfig, vehicleTypeLabel } from '../lib/utils';

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const [form, setForm] = useState(
    vehicle || { plate_number: '', vehicle_type: 'motor', brand: '', color: '' }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          <h3 className="section-title">{vehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nomor Plat *</label>
            <input
              className="input-field font-mono uppercase tracking-widest"
              placeholder="B 1234 ABC"
              value={form.plate_number}
              onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="label">Jenis Kendaraan *</label>
            <select className="select-field" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
              <option value="motor">Motor</option>
              <option value="mobil">Mobil</option>
              <option value="truk">Truk</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Merek</label>
              <input className="input-field" placeholder="Honda, Toyota..." value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <label className="label">Warna</label>
              <input className="input-field" placeholder="Merah, Hitam..." value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              <Save size={14} />
              {vehicle ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UserPortalPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [vehicleModal, setVehicleModal] = useState(null);
  const [activeTab, setActiveTab] = useState('vehicles');

  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => api.get('/vehicles/my').then(r => r.data.data),
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => api.get('/transactions/my').then(r => r.data.data),
    enabled: activeTab === 'history',
  });

  const saveMutation = useMutation({
    mutationFn: (form) => form.id
      ? api.put(`/vehicles/${form.id}`, form)
      : api.post('/vehicles', form),
    onSuccess: () => { queryClient.invalidateQueries(['my-vehicles']); toast.success('Kendaraan disimpan'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vehicles/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['my-vehicles']); toast.success('Kendaraan dihapus'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Portal Saya</h1>
        <p className="text-dark-400 text-sm mt-1">Kelola kendaraan dan lihat riwayat parkir Anda</p>
      </div>

      {/* Profile card */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-400 font-bold text-xl">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h3 className="font-semibold text-dark-100 text-lg">{user?.name}</h3>
          <p className="text-dark-400 text-sm">{user?.email}</p>
          <span className={`badge mt-1 ${
            user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
            user?.role === 'operator' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            'bg-dark-600/50 text-dark-300 border border-dark-500/30'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 border border-dark-700 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'vehicles' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <Car size={16} />
          Kendaraan Saya
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <History size={16} />
          Riwayat Parkir
        </button>
      </div>

      {/* Vehicles tab */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setVehicleModal('add')} className="btn-primary text-sm">
              <Plus size={14} />
              Tambah Kendaraan
            </button>
          </div>

          {loadingVehicles ? (
            Array(2).fill(0).map((_, i) => <div key={i} className="card h-24 skeleton" />)
          ) : vehicles?.length === 0 ? (
            <div className="card text-center py-12">
              <Car size={40} className="mx-auto text-dark-600 mb-3" />
              <p className="text-dark-400">Belum ada kendaraan terdaftar</p>
              <button onClick={() => setVehicleModal('add')} className="btn-primary mx-auto mt-4 text-sm">
                <Plus size={14} />
                Tambah Kendaraan
              </button>
            </div>
          ) : (
            vehicles?.map(v => (
              <div key={v.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">
                    {v.vehicle_type === 'motor' ? '🏍️' : v.vehicle_type === 'mobil' ? '🚗' : '🚛'}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-dark-100 text-lg">{v.plate_number}</p>
                    <p className="text-sm text-dark-400">
                      {vehicleTypeLabel(v.vehicle_type)}
                      {v.brand && ` • ${v.brand}`}
                      {v.color && ` • ${v.color}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVehicleModal(v)}
                    className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Hapus kendaraan ini?')) deleteMutation.mutate(v.id); }}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800 border-b border-dark-700">
                <tr>
                  <th className="table-header text-left">Plat</th>
                  <th className="table-header text-left">Slot</th>
                  <th className="table-header text-left">Check-In</th>
                  <th className="table-header text-left">Durasi</th>
                  <th className="table-header text-left">Biaya</th>
                  <th className="table-header text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-dark-800">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="table-cell"><div className="h-4 skeleton rounded w-16" /></td>
                      ))}
                    </tr>
                  ))
                ) : history?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center text-dark-500 py-12">
                      <History size={32} className="mx-auto mb-2 opacity-30" />
                      Belum ada riwayat parkir
                    </td>
                  </tr>
                ) : (
                  history?.map(tx => {
                    const status = paymentStatusConfig[tx.payment_status];
                    return (
                      <tr key={tx.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                        <td className="table-cell font-mono font-medium text-dark-100">{tx.plate_number}</td>
                        <td className="table-cell font-mono text-primary-400">{tx.slot_code}</td>
                        <td className="table-cell text-xs text-dark-300">{formatDateTime(tx.check_in)}</td>
                        <td className="table-cell text-dark-300">{formatDuration(tx.duration_minutes)}</td>
                        <td className="table-cell font-medium">{tx.fee ? formatRupiah(tx.fee) : '-'}</td>
                        <td className="table-cell">
                          <span className={`badge ${status?.className}`}>{status?.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vehicleModal && (
        <VehicleModal
          vehicle={vehicleModal === 'add' ? null : vehicleModal}
          onClose={() => setVehicleModal(null)}
          onSave={(form) => saveMutation.mutateAsync(form)}
        />
      )}
    </div>
  );
}
