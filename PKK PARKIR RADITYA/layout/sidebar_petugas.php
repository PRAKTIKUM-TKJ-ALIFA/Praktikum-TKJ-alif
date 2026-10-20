<?php
$current = basename($_SERVER['PHP_SELF']);
?>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="assets/css/style.css">

<aside class="sidebar">
  <!-- Logo -->
  <div class="sidebar-logo">
    <div class="logo-icon">
      <i class="fas fa-square-parking"></i>
    </div>
    <div class="logo-text">
      <h2>Radit Parkir</h2>
      <span><?= ucfirst($_SESSION['role'] ?? 'Petugas') ?></span>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="sidebar-nav">
    <div class="nav-label">Menu Petugas</div>

    <a href="petugas.php" class="menu-item <?= $current === 'petugas.php' ? 'active' : '' ?>">
      <i class="fas fa-gauge-high"></i>
      <span>Beranda</span>
    </a>

    <a href="parkir_masuk.php" class="menu-item <?= $current === 'parkir_masuk.php' ? 'active' : '' ?>">
      <i class="fas fa-car-side"></i>
      <span>Kendaraan Masuk</span>
    </a>

    <a href="parkir_keluar.php" class="menu-item <?= $current === 'parkir_keluar.php' ? 'active' : '' ?>">
      <i class="fas fa-car-rear"></i>
      <span>Kendaraan Keluar</span>
    </a>

    <a href="riwayat.php" class="menu-item <?= $current === 'riwayat.php' ? 'active' : '' ?>">
      <i class="fas fa-clock-rotate-left"></i>
      <span>Riwayat Shift</span>
    </a>
  </nav>

  <!-- Footer -->
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="avatar">
        <?= strtoupper(substr($_SESSION['nama'] ?? $_SESSION['username'] ?? 'P', 0, 1)) ?>
      </div>
      <div class="user-info">
        <p><?= htmlspecialchars($_SESSION['nama'] ?? $_SESSION['username'] ?? '') ?></p>
        <span><?= ucfirst($_SESSION['role'] ?? 'petugas') ?></span>
      </div>
    </div>
    <a href="logout.php" class="btn-logout">
      <i class="fas fa-right-from-bracket"></i>
      Keluar
    </a>
  </div>
</aside>
