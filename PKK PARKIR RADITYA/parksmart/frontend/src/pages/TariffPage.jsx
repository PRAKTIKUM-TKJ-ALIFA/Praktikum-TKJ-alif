import React from 'react';
import { Lock, Info } from 'lucide-react';
import { formatRupiah } from '../lib/utils';

const FIXED_RATE = 5000;

const vehicleTypes = [
  { type: 'motor', emoji: '🏍️', label: 'Motor' },
  { type: 'mobil', emoji: '🚗', label: 'Mobil' },
  { type: 'truk',  emoji: '🚛', label: 'Truk' },
];

const TariffCard = ({ emoji, label, type }) => (
  <div className="card">
    <div className="flex items-center gap-3 mb-6">
      <div className="text-3xl">{emoji}</div>
      <div>
        <h3 className="section-title">{label}</h3>
        <p className="text-xs text-dark-500 capitalize">{type}</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <label className="label">Tarif Parkir (Rp)</label>
        <div className="input-field flex items-center justify-between bg-dark-800 cursor-not-allowed opacity-70">
          <span className="font-semibold text-dark-100">{formatRupiah(FIXED_RATE)}</span>
          <Lock size={14} className="text-dark-500" />
        </div>
        <p className="text-xs text-dark-500 mt-1">Tarif flat — berlaku untuk semua durasi</p>
      </div>

      <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
        <Lock size={13} className="text-yellow-400 flex-shrink-0" />
        <p className="text-xs text-yellow-400">Tarif dikunci dan tidak dapat diubah</p>
      </div>
    </div>
  </div>
);

export default function TariffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Manajemen Tarif</h1>
        <p className="text-dark-400 text-sm mt-1">Informasi tarif parkir yang berlaku</p>
      </div>

      {/* Info box */}
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <p className="font-medium text-primary-400 mb-1">Tarif Parkir Tetap</p>
          <p className="text-dark-400">
            Semua jenis kendaraan dikenakan tarif flat <strong className="text-dark-200">Rp 5.000</strong> per kunjungan,
            tanpa memandang durasi parkir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicleTypes.map(({ type, emoji, label }) => (
          <TariffCard key={type} type={type} emoji={emoji} label={label} />
        ))}
      </div>

      {/* Summary table */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="section-title">Ringkasan Tarif Aktif</h3>
          <Lock size={14} className="text-dark-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="table-header text-left">Kendaraan</th>
                <th className="table-header text-right">Tarif per Kunjungan</th>
                <th className="table-header text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicleTypes.map(({ type, emoji, label }) => (
                <tr key={type} className="border-b border-dark-800">
                  <td className="table-cell capitalize font-medium text-dark-100">
                    {emoji} {label}
                  </td>
                  <td className="table-cell text-right font-semibold text-primary-400">
                    {formatRupiah(FIXED_RATE)}
                  </td>
                  <td className="table-cell text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                      <Lock size={10} /> Dikunci
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
