// Format currency to Rupiah
export const formatRupiah = (amount) => {
  if (amount == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format datetime to WIB readable
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date only
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format duration
export const formatDuration = (minutes) => {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
};

// Vehicle type label
export const vehicleTypeLabel = (type) => {
  const map = { motor: 'Motor', mobil: 'Mobil', truk: 'Truk' };
  return map[type] || type;
};

// Payment status badge config
export const paymentStatusConfig = {
  paid: { label: 'Lunas', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  unpaid: { label: 'Belum Bayar', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

// Slot status config
export const slotStatusConfig = {
  available: { label: 'Tersedia', className: 'slot-available', dot: 'bg-emerald-400' },
  occupied: { label: 'Terisi', className: 'slot-occupied', dot: 'bg-red-400' },
  reserved: { label: 'Dipesan', className: 'slot-reserved', dot: 'bg-amber-400' },
  maintenance: { label: 'Maintenance', className: 'slot-maintenance', dot: 'bg-dark-400' },
};

// Role badge config
export const roleConfig = {
  admin: { label: 'Admin', className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  operator: { label: 'Operator', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  user: { label: 'User', className: 'bg-dark-600/50 text-dark-300 border border-dark-500/30' },
};

// Payment method label
export const paymentMethodLabel = (method) => {
  const map = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' };
  return map[method] || method || '-';
};

// Truncate text
export const truncate = (str, n = 20) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '...' : str;
};
