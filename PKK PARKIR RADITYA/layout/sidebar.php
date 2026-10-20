<?php
// Tentukan halaman aktif
$current = basename($_SERVER['PHP_SELF']);
?>
<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="<?= (strpos($current, '.php') !== false && dirname($_SERVER['PHP_SELF']) !== '/') ? '../' : '' ?>assets/css/style.css">

<aside class="sidebar">
  <!-- Logo -->
  <div class="sidebar-logo">
    <div class="logo-icon">
      <i class="fas fa-square-parking"></i>
    </div>
    <div class="logo-text">
      <h2>Radit Parkir</h2>
      <span>Management System</span>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="sidebar-nav">
    <div class="nav-label">Menu Utama</div>

    <a href="dashboard.php" class="menu-item <?= $current === 'dashboard.php' ? 'active' : '' ?>">
      <i class="fas fa-gauge-high"></i>
      <span>Dashboard</span>
    </a>

    <a href="pelanggan.php" class="menu-item <?= $current === 'pelanggan.php' ? 'active' : '' ?>">
      <i class="fas fa-users"></i>
      <span>Pelanggan</span>
    </a>

    <a href="kendaraan.php" class="menu-item <?= $current === 'kendaraan.php' ? 'active' : '' ?>">
      <i class="fas fa-car"></i>
      <span>Data Kendaraan</span>
    </a>

    <a href="transaksi.php" class="menu-item <?= $current === 'transaksi.php' ? 'active' : '' ?>">
      <i class="fas fa-receipt"></i>
      <span>Transaksi</span>
    </a>

    <div class="nav-label" style="margin-top:8px;">Laporan & Pengaturan</div>

    <a href="#" class="menu-item">
      <i class="fas fa-chart-bar"></i>
      <span>Laporan</span>
    </a>

    <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
    <a href="users.php" class="menu-item <?= $current === 'users.php' ? 'active' : '' ?>">
      <i class="fas fa-users-gear"></i>
      <span>Manajemen User</span>
    </a>
    <?php endif; ?>

    <a href="#" class="menu-item">
      <i class="fas fa-gear"></i>
      <span>Pengaturan</span>
    </a>
  </nav>

  <!-- Footer -->
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="avatar">
        <?= strtoupper(substr($_SESSION['username'] ?? 'A', 0, 1)) ?>
      </div>
      <div class="user-info">
        <p><?= htmlspecialchars($_SESSION['nama'] ?? $_SESSION['username'] ?? 'Admin') ?></p>
        <span><?= ucfirst($_SESSION['role'] ?? 'admin') ?></span>
      </div>
    </div>
    <a href="logout.php" class="btn-logout">
      <i class="fas fa-right-from-bracket"></i>
      Keluar
    </a>
  </div>
</aside>
