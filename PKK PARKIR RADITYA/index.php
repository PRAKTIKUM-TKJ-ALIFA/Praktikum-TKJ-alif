<?php
session_start();
// Jika sudah login, langsung redirect
if (isset($_SESSION['user_id'])) {
    header("Location: " . ($_SESSION['role'] === 'admin' ? 'dashboard.php' : 'petugas.php'));
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Radit Parkir — Pilih Portal</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #eff6ff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    body::before {
      content: '';
      position: absolute;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(220,38,38,.06), transparent 70%);
      top: -200px; right: -200px;
      pointer-events: none;
    }

    body::after {
      content: '';
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(29,78,216,.05), transparent 70%);
      bottom: -150px; left: -150px;
      pointer-events: none;
    }

    .portal-wrap {
      width: 100%;
      max-width: 860px;
      position: relative;
      z-index: 1;
    }

    /* Header */
    .portal-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .portal-header .logo-box {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, #dc2626, #ef4444);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 24px rgba(220,38,38,.3);
    }

    .portal-header .logo-box i {
      font-size: 32px;
      color: white;
    }

    .portal-header h1 {
      font-size: 32px;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .portal-header p {
      font-size: 15px;
      color: #6b7280;
    }

    /* Cards */
    .portal-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .portal-card {
      background: white;
      border-radius: 20px;
      padding: 36px 32px;
      text-decoration: none;
      border: 2px solid transparent;
      box-shadow: 0 4px 20px rgba(0,0,0,.07);
      transition: all .25s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .portal-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
    }

    .portal-card.admin::before  { background: linear-gradient(90deg, #dc2626, #ef4444); }
    .portal-card.petugas::before { background: linear-gradient(90deg, #1d4ed8, #3b82f6); }

    .portal-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,.12);
    }

    .portal-card.admin:hover   { border-color: #fecaca; }
    .portal-card.petugas:hover { border-color: #bfdbfe; }

    .portal-card .card-icon {
      width: 80px; height: 80px;
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px;
      margin-bottom: 20px;
    }

    .portal-card.admin   .card-icon { background: #fff5f5; color: #dc2626; }
    .portal-card.petugas .card-icon { background: #eff6ff; color: #2563eb; }

    .portal-card h2 {
      font-size: 20px;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .portal-card p {
      font-size: 13.5px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .portal-card .feature-list {
      list-style: none;
      width: 100%;
      margin-bottom: 28px;
      text-align: left;
    }

    .portal-card .feature-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #4b5563;
      padding: 6px 0;
      border-bottom: 1px solid #f9fafb;
    }

    .portal-card .feature-list li:last-child { border-bottom: none; }

    .portal-card.admin   .feature-list li i { color: #dc2626; }
    .portal-card.petugas .feature-list li i { color: #2563eb; }

    .portal-card .btn-portal {
      width: 100%;
      padding: 13px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      font-family: inherit;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all .2s;
      text-decoration: none;
    }

    .portal-card.admin   .btn-portal {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white;
      box-shadow: 0 4px 14px rgba(220,38,38,.3);
    }

    .portal-card.petugas .btn-portal {
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      color: white;
      box-shadow: 0 4px 14px rgba(29,78,216,.3);
    }

    .portal-card .btn-portal:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,.2);
    }

    @media (max-width: 640px) {
      .portal-cards { grid-template-columns: 1fr; }
      .portal-header h1 { font-size: 24px; }
    }
  </style>
</head>
<body>

  <div class="portal-wrap">

    <!-- Header -->
    <div class="portal-header">
      <div class="logo-box">
        <i class="fas fa-square-parking"></i>
      </div>
      <h1>Radit Parkir</h1>
      <p>Sistem Manajemen Parkir — Pilih portal sesuai peran Anda</p>
    </div>

    <!-- Portal Cards -->
    <div class="portal-cards">

      <!-- Admin -->
      <a href="login.php" class="portal-card admin">
        <div class="card-icon">
          <i class="fas fa-shield-halved"></i>
        </div>
        <h2>Portal Admin</h2>
        <p>Akses penuh untuk mengelola seluruh sistem, laporan, dan pengguna.</p>
        <ul class="feature-list">
          <li><i class="fas fa-check-circle"></i> Dashboard & Statistik</li>
          <li><i class="fas fa-check-circle"></i> Manajemen Pelanggan</li>
          <li><i class="fas fa-check-circle"></i> Laporan Transaksi</li>
          <li><i class="fas fa-check-circle"></i> Manajemen User</li>
        </ul>
        <span class="btn-portal">
          <i class="fas fa-right-to-bracket"></i>
          Masuk sebagai Admin
        </span>
      </a>

      <!-- Petugas -->
      <a href="login_petugas.php" class="portal-card petugas">
        <div class="card-icon">
          <i class="fas fa-id-badge"></i>
        </div>
        <h2>Portal Petugas</h2>
        <p>Akses khusus untuk mencatat kendaraan masuk dan keluar area parkir.</p>
        <ul class="feature-list">
          <li><i class="fas fa-check-circle"></i> Catat Kendaraan Masuk</li>
          <li><i class="fas fa-check-circle"></i> Proses Kendaraan Keluar</li>
          <li><i class="fas fa-check-circle"></i> Cetak Tiket & Struk</li>
          <li><i class="fas fa-check-circle"></i> Riwayat Shift Hari Ini</li>
        </ul>
        <span class="btn-portal">
          <i class="fas fa-right-to-bracket"></i>
          Masuk sebagai Petugas
        </span>
      </a>

    </div>

  </div>

</body>
</html>
