<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
// Petugas/operator tidak boleh masuk dashboard admin
if (isset($_SESSION['role']) && $_SESSION['role'] !== 'admin') {
    header("Location: petugas.php");
    exit;
}
require_once 'config/koneksi.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div style="display:flex;">
  <?php include 'layout/sidebar.php'; ?>

  <div class="main" style="flex:1;">

    <!-- TOPBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <h1>Dashboard</h1>
        <p>Selamat datang, <?= htmlspecialchars($_SESSION['username']) ?> 👋</p>
      </div>
      <div class="topbar-right">
        <div class="topbar-badge">
          <i class="fas fa-circle" style="color:#22c55e;font-size:8px;"></i>
          <?= date('d M Y, H:i') ?> WIB
        </div>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="cards">
      <div class="stat-card">
        <div class="stat-icon red">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-body">
          <h3>Total Pelanggan</h3>
          <p>120</p>
          <small>+8 bulan ini</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="fas fa-car"></i>
        </div>
        <div class="stat-body">
          <h3>Kendaraan Masuk</h3>
          <p>45</p>
          <small>Hari ini</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-body">
          <h3>Pendapatan Hari Ini</h3>
          <p>Rp 1,2 Jt</p>
          <small>+12% dari kemarin</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon amber">
          <i class="fas fa-square-parking"></i>
        </div>
        <div class="stat-body">
          <h3>Slot Tersedia</h3>
          <p>18</p>
          <small>dari 50 total slot</small>
        </div>
      </div>
    </div>

    <!-- RECENT TRANSACTIONS -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-receipt"></i> Transaksi Terbaru</h2>
        <a href="transaksi.php" class="btn btn-outline btn-sm">
          <i class="fas fa-arrow-right"></i> Lihat Semua
        </a>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Kendaraan</th>
              <th>Plat Nomor</th>
              <th>Jam Masuk</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><strong>Budi Santoso</strong></td>
              <td><span class="badge badge-blue"><i class="fas fa-motorcycle"></i> Motor</span></td>
              <td><code>D 1234 XX</code></td>
              <td>08:30</td>
              <td><strong>Rp 5.000</strong></td>
              <td><span class="badge badge-green"><i class="fas fa-check"></i> Lunas</span></td>
            </tr>
            <tr>
              <td>2</td>
              <td><strong>Siti Rahayu</strong></td>
              <td><span class="badge badge-red"><i class="fas fa-car"></i> Mobil</span></td>
              <td><code>B 5678 YY</code></td>
              <td>09:15</td>
              <td><strong>Rp 10.000</strong></td>
              <td><span class="badge badge-amber"><i class="fas fa-clock"></i> Proses</span></td>
            </tr>
            <tr>
              <td>3</td>
              <td><strong>Ahmad Fauzi</strong></td>
              <td><span class="badge badge-blue"><i class="fas fa-motorcycle"></i> Motor</span></td>
              <td><code>F 9012 ZZ</code></td>
              <td>10:00</td>
              <td><strong>Rp 5.000</strong></td>
              <td><span class="badge badge-green"><i class="fas fa-check"></i> Lunas</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

</body>
</html>
