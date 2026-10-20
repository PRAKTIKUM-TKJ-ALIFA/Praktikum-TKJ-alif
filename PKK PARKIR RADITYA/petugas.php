<?php
session_start();
if (!isset($_SESSION['user_id']))  { header("Location: login.php");    exit; }
if ($_SESSION['role'] === 'admin') { header("Location: dashboard.php"); exit; }

// Ambil ringkasan dari localStorage via JS — data transaksi hari ini
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beranda Petugas — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div style="display:flex;">
  <?php include 'layout/sidebar_petugas.php'; ?>

  <div class="main" style="flex:1;">

    <!-- TOPBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <h1>Beranda Petugas</h1>
        <p>Selamat bertugas, <strong><?= htmlspecialchars($_SESSION['nama'] ?? $_SESSION['username']) ?></strong> 👋</p>
      </div>
      <div class="topbar-right">
        <div class="topbar-badge">
          <i class="fas fa-circle" style="color:#22c55e;font-size:8px;"></i>
          <span id="jamSekarang"></span>
        </div>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="fas fa-car-side"></i>
        </div>
        <div class="stat-body">
          <h3>Kendaraan Masuk Hari Ini</h3>
          <p id="statMasuk">0</p>
          <small>Total kendaraan masuk</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-car-rear"></i>
        </div>
        <div class="stat-body">
          <h3>Kendaraan Keluar</h3>
          <p id="statKeluar">0</p>
          <small>Sudah selesai parkir</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon amber">
          <i class="fas fa-square-parking"></i>
        </div>
        <div class="stat-body">
          <h3>Sedang Parkir</h3>
          <p id="statAktif">0</p>
          <small>Kendaraan di area parkir</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-body">
          <h3>Pendapatan Shift Ini</h3>
          <p id="statPendapatan">Rp 0</p>
          <small>Total biaya terkumpul</small>
        </div>
      </div>
    </div>

    <!-- AKSI CEPAT -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-bolt"></i> Aksi Cepat</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
        <a href="parkir_masuk.php" style="text-decoration:none;">
          <div style="background:linear-gradient(135deg,#dc2626,#ef4444);border-radius:14px;padding:24px;
                      text-align:center;color:white;transition:transform .2s,box-shadow .2s;
                      box-shadow:0 4px 16px rgba(220,38,38,.3);"
               onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(220,38,38,.4)'"
               onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(220,38,38,.3)'">
            <i class="fas fa-car-side" style="font-size:32px;margin-bottom:12px;display:block;"></i>
            <strong style="font-size:15px;">Catat Masuk</strong>
            <p style="font-size:12px;opacity:.85;margin-top:4px;">Kendaraan baru masuk</p>
          </div>
        </a>

        <a href="parkir_keluar.php" style="text-decoration:none;">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);border-radius:14px;padding:24px;
                      text-align:center;color:white;transition:transform .2s,box-shadow .2s;
                      box-shadow:0 4px 16px rgba(22,163,74,.3);"
               onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(22,163,74,.4)'"
               onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(22,163,74,.3)'">
            <i class="fas fa-car-rear" style="font-size:32px;margin-bottom:12px;display:block;"></i>
            <strong style="font-size:15px;">Catat Keluar</strong>
            <p style="font-size:12px;opacity:.85;margin-top:4px;">Proses kendaraan keluar</p>
          </div>
        </a>

        <a href="riwayat.php" style="text-decoration:none;">
          <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:14px;padding:24px;
                      text-align:center;color:white;transition:transform .2s,box-shadow .2s;
                      box-shadow:0 4px 16px rgba(37,99,235,.3);"
               onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,.4)'"
               onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(37,99,235,.3)'">
            <i class="fas fa-clock-rotate-left" style="font-size:32px;margin-bottom:12px;display:block;"></i>
            <strong style="font-size:15px;">Riwayat Shift</strong>
            <p style="font-size:12px;opacity:.85;margin-top:4px;">Lihat transaksi hari ini</p>
          </div>
        </a>
      </div>
    </div>

    <!-- KENDARAAN AKTIF -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-square-parking"></i> Kendaraan Sedang Parkir</h2>
        <span id="badgeAktif" class="badge badge-amber">0 kendaraan</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Plat Nomor</th>
              <th>Jenis</th>
              <th>Jam Masuk</th>
              <th>Durasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="tabelAktif">
            <tr>
              <td colspan="6" style="text-align:center;padding:24px;color:#9ca3af;">
                <i class="fas fa-square-parking" style="font-size:24px;display:block;margin-bottom:8px;opacity:.3;"></i>
                Belum ada kendaraan parkir
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script>

function updateJam() {
  const now = new Date();
  document.getElementById('jamSekarang').textContent =
    now.toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'}) + ', ' +
    now.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}) + ' WIB';
}
updateJam();
setInterval(updateJam, 1000);

// Hitung statistik dari localStorage
function hitungStats() {
  const data = JSON.parse(localStorage.getItem('transaksi_data')) || [];
  const today = new Date().toLocaleDateString('id-ID');

  let masuk = 0, keluar = 0, pendapatan = 0;
  const aktifList = [];

  data.forEach((d, i) => {
    // Semua data dihitung (localStorage tidak ada filter tanggal, tapi kita tampilkan semua)
    masuk++;
    if (d.keluar) {
      keluar++;
      pendapatan += Number(d.biaya) || 0;
    } else {
      aktifList.push({ ...d, idx: i });
    }
  });

  document.getElementById('statMasuk').textContent      = masuk;
  document.getElementById('statKeluar').textContent     = keluar;
  document.getElementById('statAktif').textContent      = aktifList.length;
  document.getElementById('statPendapatan').textContent = 'Rp ' + pendapatan.toLocaleString('id-ID');
  document.getElementById('badgeAktif').textContent     = aktifList.length + ' kendaraan';

  // Render tabel aktif
  const tbody = document.getElementById('tabelAktif');
  if (aktifList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#9ca3af;">
      <i class="fas fa-square-parking" style="font-size:24px;display:block;margin-bottom:8px;opacity:.3;"></i>
      Belum ada kendaraan parkir</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  aktifList.forEach((d, i) => {
    // Hitung durasi
    let durasi = '-';
    if (d.masuk) {
      const [h, m] = d.masuk.split(':').map(Number);
      const now = new Date();
      const masukMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
      const diffMin = Math.floor((now.getTime() - masukMs) / 60000);
      if (diffMin >= 0) {
        const jam = Math.floor(diffMin / 60);
        const mnt = diffMin % 60;
        durasi = jam > 0 ? `${jam}j ${mnt}m` : `${mnt} menit`;
      }
    }
    const icon = d.jenis === 'Motor' ? '🏍️' : d.jenis === 'Mobil' ? '🚗' : '🚛';
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><code style="font-size:14px;font-weight:700;">${d.plat}</code></td>
        <td>${icon} ${d.jenis}</td>
        <td>${d.masuk}</td>
        <td><span class="badge badge-amber">${durasi}</span></td>
        <td>
          <a href="parkir_keluar.php?plat=${encodeURIComponent(d.plat)}" class="btn btn-success btn-sm">
            <i class="fas fa-car-rear"></i> Proses Keluar
          </a>
        </td>
      </tr>`;
  });
}

hitungStats();
setInterval(hitungStats, 30000); // refresh tiap 30 detik
</script>

</body>
</html>
