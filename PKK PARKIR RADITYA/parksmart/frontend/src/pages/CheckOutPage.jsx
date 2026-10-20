import React, { useState } from 'react';
import { LogOut, Search, Clock, MapPin, CreditCard, CheckCircle, Banknote, QrCode, ArrowLeftRight, Lock } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { formatRupiah, formatDateTime, formatDuration, vehicleTypeLabel } from '../lib/utils';

const FIXED_RATE_PER_HOUR = 5000;

export default function CheckOutPage() {
  const [identifier, setIdentifier] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receipt, setReceipt] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLookupLoading(true);
    setTransaction(null);
    try {
      const { data } = await api.get(`/transactions/lookup/${identifier.trim()}`);
      setTransaction(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaksi tidak ditemukan');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/transactions/checkout', {
        identifier: identifier.trim(),
        payment_method: paymentMethod,
      });
      setReceipt(data.data);
      setTransaction(null);
      setIdentifier('');
      toast.success('Check-out berhasil!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out gagal');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tunai', icon: Banknote },
    { value: 'qris', label: 'QRIS', icon: QrCode },
    { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Check-Out Kendaraan</h1>
        <p className="text-dark-400 text-sm mt-1">Proses pembayaran dan keluarkan kendaraan</p>
      </div>

      {/* Lookup form */}
      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Search size={18} className="text-primary-400" />
          Cari Transaksi
        </h2>
        <form onSubmit={handleLookup} className="flex gap-3">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Nomor plat (B 1234 ABC) atau ID transaksi"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <button type="submit" disabled={lookupLoading} className="btn-primary px-6">
            {lookupLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Search size={16} />
            )}
            Cari
          </button>
        </form>
      </div>

      {/* Transaction detail */}
      {transaction && (
        <div className="card animate-fade-in">
          <h3 className="section-title mb-5">Detail Parkir</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-800 rounded-xl p-4">
              <p className="text-xs text-dark-400 mb-1">Kendaraan</p>
              <p className="text-xl font-bold font-mono text-dark-50">{transaction.plate_number}</p>
              <p className="text-sm text-dark-400 capitalize mt-0.5">{vehicleTypeLabel(transaction.vehicle_type)}</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-4">
              <p className="text-xs text-dark-400 mb-1">Slot Parkir</p>
              <p className="text-xl font-bold font-mono text-primary-400">{transaction.slot_code}</p>
              <p className="text-sm text-dark-400 mt-0.5">Lantai {transaction.floor}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2 border-b border-dark-700">
              <span className="text-sm text-dark-400 flex items-center gap-2"><Clock size={14} />Check-In</span>
              <span className="text-sm text-dark-200">{formatDateTime(transaction.check_in)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dark-700">
              <span className="text-sm text-dark-400">Durasi (estimasi)</span>
              <span className="text-sm text-dark-200">{formatDuration(transaction.duration_minutes)}</span>
            </div>
            {/* Tarif tetap — tidak bisa diubah */}
            <div className="flex items-center justify-between py-2 border-b border-dark-700">
              <span className="text-sm text-dark-400 flex items-center gap-1.5">
                <Lock size={12} className="text-yellow-400" />
                Tarif Parkir
              </span>
              <span className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                {formatRupiah(FIXED_RATE_PER_HOUR)}/jam
                <Lock size={11} />
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-dark-300">Estimasi Biaya</span>
              <span className="text-xl font-bold text-primary-400">{formatRupiah(transaction.estimated_fee)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-6">
            <label className="label">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === value
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  <Icon size={20} className="mx-auto mb-1" />
                  <div className="text-xs font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {checkoutLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              <>
                <CreditCard size={18} />
                Bayar & Check-Out
              </>
            )}
          </button>
        </div>
      )}

      {/* Receipt */}
      {receipt && (
        <div className="card border-emerald-500/30 bg-emerald-500/5 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 mb-6">
            <CheckCircle size={20} />
            <h3 className="font-semibold">Pembayaran Berhasil</h3>
          </div>

          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold font-mono text-dark-50">{receipt.plate_number}</div>
              <div className="text-dark-400 text-sm mt-1 capitalize">{vehicleTypeLabel(receipt.vehicle_type)}</div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Slot</span>
                <span className="font-mono text-primary-400">{receipt.slot_code} (Lt.{receipt.floor})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Check-In</span>
                <span className="text-dark-200">{formatDateTime(receipt.check_in)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Check-Out</span>
                <span className="text-dark-200">{formatDateTime(receipt.check_out)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Durasi</span>
                <span className="text-dark-200">{formatDuration(receipt.duration_minutes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Pembayaran</span>
                <span className="text-dark-200 capitalize">{receipt.payment_method}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-dark-700">
                <span className="font-semibold text-dark-200">Total Biaya</span>
                <span className="text-xl font-bold text-emerald-400">{formatRupiah(receipt.fee)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setReceipt(null)}
            className="btn-secondary w-full justify-center mt-4"
          >
            Transaksi Baru
          </button>
        </div>
      )}
    </div>
  );
}
