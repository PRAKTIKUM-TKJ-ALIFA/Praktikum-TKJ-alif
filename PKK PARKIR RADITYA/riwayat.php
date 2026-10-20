<?php
session_start();
if (!isset($_SESSION['user_id']))  { header("Location: login.php");    exit; }
if ($_SESSION['role'] === 'admin') { header("Location: dashboard.php"); exit; }
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Riwayat Shift — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    @media print {
      .sidebar,.topbar,.no-print { display:none !important; }
      .main { margin-left:0 !important; padding:0 !important; }
    }
  </style>
</head>
<body>

<div style="display:flex;">
  <?php include 'layout/sidebar_petugas.php'; ?>

  <div class="main" style="flex:1;">

    <!-- TOPBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <h1>Riwayat Shift</h1>
        <p>Semua transaksi yang dicatat pada shift ini</p>
      </div>
      <div class="topbar-right no-print">
        <button onclick="window.print()" class="btn btn-info btn-sm">
          <i class="fas fa-print"></i> Cetak Laporan
        </button>
        <button onclick="hapusSemua()" class="btn btn-danger btn-sm" style="margin-left:8px;">
          <i class="fas fa-trash"></i> Hapus Semua
        </button>
      </div>
    </div>

    <!-- RINGKASAN -->
    <div class="cards" id="ringkasan"></div>

    <!-- TABEL -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-clock-rotate-left"></i> Daftar Transaksi</h2>
        <span id="counterBadge" class="badge badge-red">0 data</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Plat Nomor</th>
              <th>Jenis</th>
              <th>Nama</th>
              <th>Jam Masuk</th>
              <th>Jam Keluar</th>
              <th>Durasi</th>
              <th>Biaya</th>
              <th>Metode</th>
              <th>Status</th>
              <th class="no-print">Aksi</th>
            </tr>
          </thead>
          <tbody id="tabelRiwayat"></tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script>
function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function hitungDurasi(masuk, keluar) {
  if (!masuk) return '-';
  const [h1, m1] = masuk.split(':').map(Number);
  const now = new Date();
  let endMs;
  if (keluar) {
    const [h2, m2] = keluar.split(':').map(Number);
    endMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h2, m2).getTime();
  } else {
    endMs = now.getTime();
  }
  const startMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h1, m1).getTime();
  const diff = Math.max(0, Math.floor((endMs - startMs) / 60000));
  const j = Math.floor(diff / 60), m = diff % 60;
  return j > 0 ? `${j}j ${m}m` : `${m} menit`;
}

function render() {
  const data = JSON.parse(localStorage.getItem('transaksi_data')) || [];
  const tbody = document.getElementById('tabelRiwayat');
  const counter = document.getElementById('counterBadge');

  counter.textContent = data.length + ' data';

  let totalPendapatan = 0, totalMasuk = data.length, totalKeluar = 0;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:#9ca3af;">
      <i class="fas fa-clock-rotate-left" style="font-size:28px;display:block;margin-bottom:8px;opacity:.3;"></i>
      Belum ada transaksi</td></tr>`;
  } else {
    tbody.innerHTML = '';
    data.forEach((d, i) => {
      const icon = d.jenis === 'Motor' ? '🏍️' : d.jenis === 'Mobil' ? '🚗' : '🚛';
      const sudahKeluar = !!d.keluar;
      if (sudahKeluar) { totalKeluar++; totalPendapatan += Number(d.biaya) || 0; }

      tbody.innerHTML += `
        <tr>
          <td style="color:#9ca3af;">${i + 1}</td>
          <td><code style="font-weight:700;">${d.plat}</code></td>
          <td>${icon} ${d.jenis}</td>
          <td>${d.nama || '-'}</td>
          <td>${d.masuk || '-'}</td>
          <td>${d.keluar || '<span class="badge badge-amber">Masih parkir</span>'}</td>
          <td>${hitungDurasi(d.masuk, d.keluar)}</td>
          <td><strong>${d.biaya ? formatRp(d.biaya) : '-'}</strong></td>
          <td>${d.metode || '-'}</td>
          <td>
            ${sudahKeluar
              ? '<span class="badge badge-green"><i class="fas fa-check"></i> Selesai</span>'
              : '<span class="badge badge-amber"><i class="fas fa-clock"></i> Parkir</span>'}
          </td>
          <td class="no-print">
            ${!sudahKeluar
              ? `<a href="parkir_keluar.php?plat=${encodeURIComponent(d.plat)}" class="btn btn-success btn-sm">
                   <i class="fas fa-car-rear"></i> Keluar
                 </a>`
              : ''}
            <button onclick="hapusSatu(${i})" class="btn btn-danger btn-sm" style="margin-left:4px;">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>`;
    });
  }

  // Ringkasan
  document.getElementById('ringkasan').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fas fa-car-side"></i></div>
      <div class="stat-body"><h3>Total Masuk</h3><p>${totalMasuk}</p></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fas fa-car-rear"></i></div>
      <div class="stat-body"><h3>Sudah Keluar</h3><p>${totalKeluar}</p></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><i class="fas fa-square-parking"></i></div>
      <div class="stat-body"><h3>Masih Parkir</h3><p>${totalMasuk - totalKeluar}</p></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon red"><i class="fas fa-money-bill-wave"></i></div>
      <div class="stat-body"><h3>Total Pendapatan</h3><p style="font-size:18px;">${formatRp(totalPendapatan)}</p></div>
    </div>
  `;
}

window.hapusSatu = function(i) {
  if (!confirm('Hapus data ini?')) return;
  const data = JSON.parse(localStorage.getItem('transaksi_data')) || [];
  data.splice(i, 1);
  localStorage.setItem('transaksi_data', JSON.stringify(data));
  render();
};

function hapusSemua() {
  if (!confirm('Hapus SEMUA data transaksi shift ini?\nTindakan ini tidak bisa dibatalkan.')) return;
  localStorage.removeItem('transaksi_data');
  render();
}

render();
</script>

</body>
</html>
