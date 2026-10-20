import React, { useState } from 'react';
import { LogIn, MapPin, Clock, Printer, CheckCircle, Lock } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { formatDateTime, vehicleTypeLabel, formatRupiah } from '../lib/utils';

const FIXED_RATE_PER_HOUR = 5000;

export default function CheckInPage() {
  const [form, setForm] = useState({ plate_number: '', vehicle_type: 'motor' });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plate_number.trim()) {
      toast.error('Nomor plat wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/checkin', {
        plate_number: form.plate_number.toUpperCase().trim(),
        vehicle_type: form.vehicle_type,
      });
      setTicket(data.data);
      toast.success('Check-in berhasil!');
      setForm({ plate_number: '', vehicle_type: 'motor' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in gagal');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Check-In Kendaraan</h1>
        <p className="text-dark-400 text-sm mt-1">Daftarkan kendaraan masuk dan assign slot parkir</p>
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="section-title mb-6 flex items-center gap-2">
          <LogIn size={18} className="text-primary-400" />
          Form Check-In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nomor Plat Kendaraan *</label>
            <input
              type="text"
              className="input-field text-lg font-mono uppercase tracking-widest"
              placeholder="B 1234 ABC"
              value={form.plate_number}
              onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })}
              required
            />
            <p className="text-xs text-dark-500 mt-1">Masukkan nomor plat tanpa spasi atau dengan spasi</p>
          </div>

          <div>
            <label className="label">Jenis Kendaraan *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'motor', label: 'Motor', emoji: '🏍️' },
                { value: 'mobil', label: 'Mobil', emoji: '🚗' },
                { value: 'truk', label: 'Truk', emoji: '🚛' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, vehicle_type: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    form.vehicle_type === type.value
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info tarif terkunci */}
          <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Lock size={14} />
              <span>Tarif Parkir</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-300 font-semibold text-sm">
              <span>{formatRupiah(FIXED_RATE_PER_HOUR)}/jam</span>
              <Lock size={12} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
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
                <LogIn size={18} />
                Proses Check-In
              </>
            )}
          </button>
        </form>
      </div>

      {/* Ticket */}
      {ticket && (
        <div className="card border-primary-500/30 bg-primary-500/5 animate-fade-in" id="ticket">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary-400">
              <CheckCircle size={20} />
              <h3 className="font-semibold">Tiket Parkir</h3>
            </div>
            <button onClick={handlePrint} className="btn-secondary text-sm">
              <Printer size={14} />
              Cetak
            </button>
          </div>

          {/* Ticket content */}
          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold font-mono text-dark-50 tracking-widest">
                {ticket.plate_number}
              </div>
              <div className="text-dark-400 text-sm mt-1 capitalize">
                {vehicleTypeLabel(ticket.vehicle_type)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-dark-400 text-xs mb-2">
                  <MapPin size={12} />
                  Slot Parkir
                </div>
                <div className="text-2xl font-bold font-mono text-primary-400">{ticket.slot_code}</div>
                <div className="text-xs text-dark-500 mt-1">Lantai {ticket.floor}</div>
              </div>

              <div className="bg-dark-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-dark-400 text-xs mb-2">
                  <Clock size={12} />
                  Waktu Masuk
                </div>
                <div className="text-sm font-semibold text-dark-100">{formatDateTime(ticket.check_in)}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-dark-500 flex items-center gap-1">
                  <Lock size={10} className="text-yellow-500" /> Tarif berlaku
                </span>
                <span className="text-yellow-400 font-medium">{formatRupiah(FIXED_RATE_PER_HOUR)}/jam</span>
              </div>
              <p className="text-xs text-dark-500 text-center">ID Transaksi: <span className="font-mono text-dark-300">#{ticket.transaction_id}</span></p>
              <p className="text-xs text-dark-600 mt-1 text-center">Simpan tiket ini untuk proses check-out</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
