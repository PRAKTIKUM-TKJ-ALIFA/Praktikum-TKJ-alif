import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ParkingSquare, Car, TrendingUp, Activity,
  CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../lib/api';
import { formatRupiah, formatDateTime, paymentStatusConfig, vehicleTypeLabel } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div>
      <p className="text-sm text-dark-400 font-medium">{title}</p>
      <p className="text-3xl font-bold text-dark-50 mt-1 font-heading">{value}</p>
      {sub && <p className="text-xs text-dark-500 mt-1">{sub}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-dark-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-primary-400">{formatRupiah(payload[0]?.value)}</p>
        {payload[1] && <p className="text-xs text-dark-300">{payload[1]?.value} transaksi</p>}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { isAdminOrOperator } = useAuth();
  const [chartPeriod, setChartPeriod] = useState('daily');

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary').then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ['revenue-chart', chartPeriod],
    queryFn: () => api.get(`/dashboard/revenue-chart?period=${chartPeriod}`).then(r => r.data.data),
  });

  const { data: recentTx, isLoading: loadingTx } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => api.get('/dashboard/recent-transactions').then(r => r.data.data),
    refetchInterval: 30000,
  });

  if (!isAdminOrOperator) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ParkingSquare size={48} className="text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-100">Selamat Datang di ParkSmart</h2>
          <p className="text-dark-400 mt-2">Gunakan menu Portal Saya untuk melihat riwayat parkir Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Ringkasan operasional parkir hari ini</p>
        </div>
        <button
          onClick={() => refetchSummary()}
          className="btn-secondary text-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card h-28 skeleton" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Slot"
              value={summary?.total_slots || 0}
              icon={ParkingSquare}
              color="bg-primary-500/20 text-primary-400"
              sub="Semua lantai"
            />
            <StatCard
              title="Tersedia"
              value={summary?.available || 0}
              icon={CheckCircle}
              color="bg-emerald-500/20 text-emerald-400"
              sub={`${summary?.total_slots ? Math.round((summary.available / summary.total_slots) * 100) : 0}% kapasitas`}
            />
            <StatCard
              title="Terisi"
              value={summary?.occupied || 0}
              icon={Car}
              color="bg-red-500/20 text-red-400"
              sub={`${summary?.reserved || 0} dipesan`}
            />
            <StatCard
              title="Pendapatan Hari Ini"
              value={formatRupiah(summary?.revenue_today || 0)}
              icon={TrendingUp}
              color="bg-amber-500/20 text-amber-400"
              sub={`${summary?.active_transactions || 0} aktif`}
            />
          </>
        )}
      </div>

      {/* Slot occupancy mini bar */}
      {summary && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Kapasitas Slot</h3>
            <div className="flex items-center gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Tersedia</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Terisi</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Dipesan</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-dark-500 inline-block" />Maintenance</span>
            </div>
          </div>
          <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
            {summary.available > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${(summary.available / summary.total_slots) * 100}%` }}
                title={`Tersedia: ${summary.available}`}
              />
            )}
            {summary.occupied > 0 && (
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${(summary.occupied / summary.total_slots) * 100}%` }}
                title={`Terisi: ${summary.occupied}`}
              />
            )}
            {summary.reserved > 0 && (
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${(summary.reserved / summary.total_slots) * 100}%` }}
                title={`Dipesan: ${summary.reserved}`}
              />
            )}
            {summary.maintenance > 0 && (
              <div
                className="bg-dark-600 transition-all duration-500"
                style={{ width: `${(summary.maintenance / summary.total_slots) * 100}%` }}
                title={`Maintenance: ${summary.maintenance}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Revenue chart + Recent transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">Grafik Pendapatan</h3>
            <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                    chartPeriod === p
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </button>
              ))}
            </div>
          </div>

          {loadingChart ? (
            <div className="h-56 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData || []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick stats */}
        <div className="card">
          <h3 className="section-title mb-4">Status Slot</h3>
          <div className="space-y-3">
            {[
              { label: 'Tersedia', value: summary?.available || 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Terisi', value: summary?.occupied || 0, color: 'bg-red-500', textColor: 'text-red-400' },
              { label: 'Dipesan', value: summary?.reserved || 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
              { label: 'Maintenance', value: summary?.maintenance || 0, color: 'bg-dark-500', textColor: 'text-dark-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-dark-300">{item.label}</span>
                </div>
                <span className={`text-sm font-semibold ${item.textColor}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-dark-700">
            <div className="flex items-center gap-2 text-dark-400">
              <Activity size={14} />
              <span className="text-xs">Aktif: {summary?.active_transactions || 0} kendaraan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h3 className="section-title mb-4">Transaksi Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="table-header text-left">Plat</th>
                <th className="table-header text-left">Jenis</th>
                <th className="table-header text-left">Slot</th>
                <th className="table-header text-left">Check-In</th>
                <th className="table-header text-left">Biaya</th>
                <th className="table-header text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingTx ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="table-cell"><div className="h-4 skeleton rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : recentTx?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-dark-500 py-8">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                recentTx?.map((tx) => {
                  const status = paymentStatusConfig[tx.payment_status];
                  return (
                    <tr key={tx.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td className="table-cell font-mono font-medium text-dark-100">{tx.plate_number}</td>
                      <td className="table-cell capitalize">{vehicleTypeLabel(tx.vehicle_type)}</td>
                      <td className="table-cell">
                        <span className="font-mono text-primary-400">{tx.slot_code}</span>
                        <span className="text-dark-500 text-xs ml-1">Lt.{tx.floor}</span>
                      </td>
                      <td className="table-cell text-xs">{formatDateTime(tx.check_in)}</td>
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
    </div>
  );
}
