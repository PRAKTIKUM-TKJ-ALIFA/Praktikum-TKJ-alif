<?php
session_start();

// Sudah login → redirect sesuai role
if (isset($_SESSION['user_id'])) {
    header("Location: " . ($_SESSION['role'] === 'admin' ? 'dashboard.php' : 'petugas.php'));
    exit;
}

require_once 'config/koneksi.php';
require_once 'config/auth.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    // Login untuk SEMUA role dari satu form
    $result = doLogin($conn, $username, $password, 'all');

    if ($result['ok']) {
        $u = $result['user'];
        $_SESSION['user_id']  = $u['id'];
        $_SESSION['username'] = $u['username'];
        $_SESSION['nama']     = $u['nama'];
        $_SESSION['role']     = $u['role'];

        // Redirect sesuai role
        if ($u['role'] === 'admin') {
            header("Location: dashboard.php");
        } else {
            header("Location: petugas.php");
        }
        exit;
    } else {
        $error = $result['error'];
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Radit Parkir</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body class="login-page">

  <div class="login-wrapper">

    <!-- LEFT PANEL -->
    <div class="login-panel-left">
      <div class="brand-icon">
        <i class="fas fa-square-parking"></i>
      </div>
      <h1>Radit Parkir</h1>
      <p>Sistem manajemen parkir modern untuk kemudahan operasional sehari-hari.</p>

      <div class="login-features">
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-users"></i></div>
          <span>Manajemen Pelanggan</span>
        </div>
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-car"></i></div>
          <span>Data Kendaraan Real-time</span>
        </div>
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-receipt"></i></div>
          <span>Laporan Transaksi Lengkap</span>
        </div>
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-chart-bar"></i></div>
          <span>Analitik & Laporan</span>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="login-panel-right">
      <h2 class="login-title">Selamat Datang 👋</h2>
      <p class="login-sub">Masuk ke akun Anda untuk melanjutkan</p>

      <?php if ($error): ?>
        <div class="alert alert-error">
          <i class="fas fa-circle-exclamation"></i>
          <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <form method="POST" action="login.php" class="login-form">
        <div class="input-group">
          <label>Username</label>
          <div class="input-wrap">
            <i class="fas fa-user"></i>
            <input
              type="text"
              name="username"
              placeholder="Masukkan username"
              value="<?= htmlspecialchars($_POST['username'] ?? '') ?>"
              required
              autocomplete="username"
            >
          </div>
        </div>

        <div class="input-group">
          <label>Password</label>
          <div class="input-wrap">
            <i class="fas fa-lock"></i>
            <input
              type="password"
              name="password"
              placeholder="Masukkan password"
              required
              autocomplete="current-password"
            >
          </div>
        </div>

        <button type="submit" class="btn-login-submit">
          <i class="fas fa-right-to-bracket"></i>
          Masuk
        </button>
      </form>
    </div>

  </div>

</body>
</html>
