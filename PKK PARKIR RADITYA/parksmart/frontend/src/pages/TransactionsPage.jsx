import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Filter, Download, Eye, X, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  formatRupiah, formatDateTime, formatDuration,
  paymentStatusConfig, vehicleTypeLabel, paymentMethodLabel
} from '../lib/utils';

const TransactionModal = ({ tx, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg animate-fade-in">
      <div className="flex items-center justify-between p-6 border-b border-dark-700">
        <h3 className="section-title">Detail Transaksi #{tx.id}</h3>
        <button onClick={onClose} className="text-dark-400 hover:text-dark-200"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-dark-500 mb-1">Plat Kendaraan</p>
            <p className="font-mono font-bold text-dark-100">{tx.plate_number}</p>
          </div>
          <div>
            <p className="text-xs text-dark-500 mb-1">Jenis</p>
            <p className="text-dark-200 capitalize">{vehicleTypeLabel(tx.vehicle_type)}</p>
          </div>
          {tx.brand && <div>
            <p className="text-xs text-dark-500 mb-1">Merek</p>
            <p className="text-dark-200">{tx.brand}</p>
          </div>}
          {tx.color && <div>
            <p className="text-xs text-dark-500 mb-1">Warna</p>
            <p className="text-dark-200">{tx.color}</p>
          </div>}
        </div>

        <div className="border-t border-dark-700 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Slot</span>
            <span className="font-mono text-primary-400">{tx.slot_code} (Lt.{tx.floor})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Check-In</span>
            <span className="text-dark-200">{formatDateTime(tx.check_in)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Check-Out</span>
            <span className="text-dark-200">{formatDateTime(tx.check_out)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Durasi</span>
            <span className="text-dark-200">{formatDuration(tx.duration_minutes)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Metode Bayar</span>
            <span className="text-dark-200">{paymentMethodLabel(tx.payment_method)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Status</span>
            <span className={`badge ${paymentStatusConfig[tx.payment_status]?.className}`}>
              {paymentStatusConfig[tx.payment_status]?.label}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-dark-700">
            <span className="font-semibold text-dark-200">Total Biaya</span>
            <span className="text-xl font-bold text-primary-400">{formatRupiah(tx.fee)}</span>
          </div>
        </div>

        {tx.user_name && (
          <div className="bg-dark-800 rounded-lg p-3 text-sm">
            <span className="text-dark-400">Operator: </span>
            <span className="text-dark-200">{tx.user_name}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    start_date: '', end_date: '', vehicle_type: '', payment_status: '', page: 1
  });
  const [selectedTx, setSelectedTx] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      return api.get(`/transactions?${params}`).then(r => r.data);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => api.patch(`/transactions/${id}/cancel`),
    onSuccess: () => { queryClient.invalidateQueries(['transactions']); toast.success('Transaksi dibatalkan'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const handleExportCSV = () => {
    if (!data?.data?.length) { toast.error('Tidak ada data'); return; }
    const headers = ['ID', 'Plat', 'Jenis', 'Slot', 'Lantai', 'Check-In', 'Check-Out', 'Durasi (menit)', 'Biaya', 'Status', 'Metode Bayar'];
    const rows = data.data.map(tx => [
      tx.id, tx.plate_number, tx.vehicle_type, tx.slot_code, tx.floor,
      tx.check_in, tx.check_out, tx.duration_minutes, tx.fee,
      tx.payment_status, tx.payment_method
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Riwayat Transaksi</h1>
          <p className="text-dark-400 text-sm mt-1">Semua transaksi parkir dengan filter lengkap</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary text-sm">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-primary-400" />
          <h3 className="font-medium text-dark-200">Filter</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Dari Tanggal</label>
            <input
              type="date"
              className="input-field"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
            />
          </div>
          <div>
            <label className="label">Sampai Tanggal</label>
            <input
              type="date"
              className="input-field"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
            />
          </div>
          <div>
            <label className="label">Jenis Kendaraan</label>
            <select
              className="select-field"
              value={filters.vehicle_type}
              onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value, page: 1 })}
            >
              <option value="">Semua</option>
              <option value="motor">Motor</option>
              <option value="mobil">Mobil</option>
              <option value="truk">Truk</option>
            </select>
          </div>
          <div>
            <label className="label">Status Bayar</label>
            <select
              className="select-field"
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value, page: 1 })}
            >
              <option value="">Semua</option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Belum Bayar</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
        {(filters.start_date || filters.end_date || filters.vehicle_type || filters.payment_status) && (
          <button
            onClick={() => setFilters({ start_date: '', end_date: '', vehicle_type: '', payment_status: '', page: 1 })}
            className="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <X size={12} />
            Reset filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="table-header text-left">ID</th>
                <th className="table-header text-left">Plat</th>
                <th className="table-header text-left">Jenis</th>
                <th className="table-header text-left">Slot</th>
                <th className="table-header text-left">Check-In</th>
                <th className="table-header text-left">Durasi</th>
                <th className="table-header text-left">Biaya</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    {Array(9).fill(0).map((_, j) => (
                      <td key={j} className="table-cell"><div className="h-4 skeleton rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-dark-500 py-12">
                    <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                    Tidak ada transaksi
                  </td>
                </tr>
              ) : (
                data?.data?.map((tx) => {
                  const status = paymentStatusConfig[tx.payment_status];
                  return (
                    <tr key={tx.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td className="table-cell font-mono text-dark-400">#{tx.id}</td>
                      <td className="table-cell font-mono font-medium text-dark-100">{tx.plate_number}</td>
                      <td className="table-cell capitalize text-dark-300">{vehicleTypeLabel(tx.vehicle_type)}</td>
                      <td className="table-cell">
                        <span className="font-mono text-primary-400">{tx.slot_code}</span>
                      </td>
                      <td className="table-cell text-xs text-dark-300">{formatDateTime(tx.check_in)}</td>
                      <td className="table-cell text-dark-300">{formatDuration(tx.duration_minutes)}</td>
                      <td className="table-cell font-medium text-dark-100">{tx.fee ? formatRupiah(tx.fee) : '-'}</td>
                      <td className="table-cell">
                        <span className={`badge ${status?.className}`}>{status?.label}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          {tx.payment_status === 'unpaid' && (
                            <button
                              onClick={() => { if (window.confirm('Batalkan transaksi ini?')) cancelMutation.mutate(tx.id); }}
                              className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <XCircle size={14} />
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

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
            <p className="text-xs text-dark-500">
              {pagination.total} transaksi, halaman {pagination.page} dari {pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.page <= 1}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.page >= pagination.total_pages}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTx && <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
