import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Map, Plus, Edit2, Trash2, RefreshCw, X, Save } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { slotStatusConfig, vehicleTypeLabel } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const SlotCard = ({ slot, onStatusChange, onEdit, onDelete, isAdmin }) => {
  const config = slotStatusConfig[slot.status];
  return (
    <div
      className={`relative p-3 rounded-xl border-2 transition-all cursor-default ${config.className}`}
      title={slot.plate_number ? `${slot.plate_number} - masuk ${slot.check_in}` : slot.slot_code}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-bold text-sm">{slot.slot_code}</span>
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      </div>
      {slot.plate_number && (
        <p className="text-xs font-mono opacity-80 truncate">{slot.plate_number}</p>
      )}
      <p className="text-xs opacity-60 mt-0.5">{config.label}</p>

      {isAdmin && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
      )}

      {/* Status change dropdown */}
      {isAdmin && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {['available', 'reserved', 'maintenance'].map((s) => (
            s !== slot.status && (
              <button
                key={s}
                onClick={() => onStatusChange(slot.id, s)}
                className="text-xs px-1.5 py-0.5 rounded bg-dark-900/50 hover:bg-dark-900 transition-colors"
              >
                {slotStatusConfig[s].label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

const SlotModal = ({ slot, onClose, onSave }) => {
  const [form, setForm] = useState(
    slot || { slot_code: '', slot_type: 'motor', floor: 'A', status: 'available' }
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
          <h3 className="section-title">{slot ? 'Edit Slot' : 'Tambah Slot'}</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Kode Slot</label>
            <input
              className="input-field font-mono uppercase"
              placeholder="A-01"
              value={form.slot_code}
              onChange={(e) => setForm({ ...form, slot_code: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jenis</label>
              <select className="select-field" value={form.slot_type} onChange={(e) => setForm({ ...form, slot_type: e.target.value })}>
                <option value="motor">Motor</option>
                <option value="mobil">Mobil</option>
                <option value="truk">Truk</option>
              </select>
            </div>
            <div>
              <label className="label">Lantai</label>
              <input
                className="input-field"
                placeholder="A"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="available">Tersedia</option>
              <option value="occupied">Terisi</option>
              <option value="reserved">Dipesan</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              <Save size={14} />
              {slot ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function SlotMapPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'add' | slot object
  const [filterFloor, setFilterFloor] = useState('all');

  const { data: slotMap, isLoading, refetch } = useQuery({
    queryKey: ['slot-map'],
    queryFn: () => api.get('/slots/map').then(r => r.data.data),
    refetchInterval: 15000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/slots/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries(['slot-map']); toast.success('Status diperbarui'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const saveMutation = useMutation({
    mutationFn: (form) => form.id
      ? api.put(`/slots/${form.id}`, form)
      : api.post('/slots', form),
    onSuccess: () => { queryClient.invalidateQueries(['slot-map']); toast.success('Slot disimpan'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/slots/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['slot-map']); toast.success('Slot dihapus'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const floors = slotMap ? Object.keys(slotMap).sort() : [];

  const getLegendCounts = () => {
    if (!slotMap) return {};
    const counts = { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
    Object.values(slotMap).forEach(slots => {
      slots.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
    });
    return counts;
  };

  const counts = getLegendCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Peta Slot Parkir</h1>
          <p className="text-dark-400 text-sm mt-1">Visualisasi real-time status slot per lantai</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn-secondary text-sm">
            <RefreshCw size={14} />
            Refresh
          </button>
          {isAdmin && (
            <button onClick={() => setModal('add')} className="btn-primary text-sm">
              <Plus size={14} />
              Tambah Slot
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-6">
          {Object.entries(slotStatusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 ${cfg.className}`} />
              <span className="text-sm text-dark-300">{cfg.label}</span>
              <span className="text-xs text-dark-500">({counts[key] || 0})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floor filter */}
      {floors.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterFloor('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterFloor === 'all' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
            }`}
          >
            Semua Lantai
          </button>
          {floors.map(floor => (
            <button
              key={floor}
              onClick={() => setFilterFloor(floor)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterFloor === floor ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
              }`}
            >
              Lantai {floor}
            </button>
          ))}
        </div>
      )}

      {/* Slot grid per floor */}
      {isLoading ? (
        <div className="card">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array(24).fill(0).map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        floors
          .filter(f => filterFloor === 'all' || f === filterFloor)
          .map(floor => (
            <div key={floor} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">
                  Lantai {floor}
                  <span className="text-dark-500 text-sm font-normal ml-2">
                    ({slotMap[floor]?.[0]?.slot_type && vehicleTypeLabel(slotMap[floor][0].slot_type)})
                  </span>
                </h3>
                <div className="text-xs text-dark-500">
                  {slotMap[floor]?.filter(s => s.status === 'available').length} tersedia / {slotMap[floor]?.length} total
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {slotMap[floor]?.map(slot => (
                  <div key={slot.id} className="group relative">
                    <SlotCard
                      slot={slot}
                      onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                      onEdit={(s) => setModal(s)}
                      onDelete={(id) => {
                        if (window.confirm('Hapus slot ini?')) deleteMutation.mutate(id);
                      }}
                      isAdmin={isAdmin}
                    />
                    {isAdmin && (
                      <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
                        <button
                          onClick={() => setModal(slot)}
                          className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Edit2 size={10} className="text-white" />
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Hapus slot ini?')) deleteMutation.mutate(slot.id); }}
                          className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Trash2 size={10} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
      )}

      {/* Modal */}
      {modal && (
        <SlotModal
          slot={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={(form) => saveMutation.mutateAsync(form)}
        />
      )}
    </div>
  );
}
