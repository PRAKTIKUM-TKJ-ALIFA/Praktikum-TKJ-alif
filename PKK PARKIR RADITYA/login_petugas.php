<?php
/**
 * login_petugas.php — Form Login PETUGAS / OPERATOR
 */
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

    $result = doLogin($conn, $username, $password, 'petugas');

    if ($result['ok']) {
        $u = $result['user'];
        $_SESSION['user_id']  = $u['id'];
        $_SESSION['username'] = $u['username'];
        $_SESSION['nama']     = $u['nama'];
        $_SESSION['role']     = $u['role'];
        header("Location: petugas.php");
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
  <title>Login Petugas — Radit Parkir</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    /* Override warna panel kiri untuk petugas — biru tua */
    .login-panel-left {
      background: linear-gradient(145deg, #1e3a5f 0%, #1d4ed8 100%) !important;
    }
  </style>
</head>
<body class="login-page">

  <div class="login-wrapper">

    <!-- LEFT PANEL — biru untuk petugas -->
    <div class="login-panel-left">
      <div class="brand-icon">
        <i class="fas fa-square-parking"></i>
      </div>
      <h1>Radit Parkir</h1>
      <p>Portal Petugas — catat kendaraan masuk & keluar dengan cepat dan mudah.</p>

      <div class="login-features">
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-car-side"></i></div>
          <span>Catat Kendaraan Masuk</span>
        </div>
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-car-rear"></i></div>
          <span>Proses Kendaraan Keluar</span>
        </div>
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-ticket"></i></div>
          <span>Cetak Tiket & Struk</span>
        </div>
        <div class="login-feature-item">
          <div class="feat-icon"><i class="fas fa-clock-rotate-left"></i></div>
          <span>Riwayat Shift Hari Ini</span>
        </div>
      </div>

      <!-- Link ke form admin -->
      <div style="margin-top:auto;padding-top:32px;">
        <a href="login.php"
           style="display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.7);
                  font-size:13px;text-decoration:none;transition:.2s;"
           onmouseover="this.style.color='white'"
           onmouseout="this.style.color='rgba(255,255,255,.7)'">
          <i class="fas fa-shield-halved"></i>
          Masuk sebagai Admin →
        </a>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="login-panel-right">
      <!-- Badge role -->
      <div style="display:inline-flex;align-items:center;gap:8px;background:#eff6ff;
                  border:1px solid #bfdbfe;border-radius:50px;padding:6px 14px;
                  margin-bottom:20px;">
        <i class="fas fa-id-badge" style="color:#2563eb;font-size:13px;"></i>
        <span style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;">
          Login Petugas
        </span>
      </div>

      <h2 class="login-title">Selamat Bertugas 👷</h2>
      <p class="login-sub">Masukkan username dan password petugas Anda</p>

      <?php if ($error): ?>
        <div class="alert alert-error">
          <i class="fas fa-circle-exclamation"></i>
          <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <form method="POST" action="login_petugas.php" class="login-form">
        <div class="input-group">
          <label>Username Petugas</label>
          <div class="input-wrap">
            <i class="fas fa-id-badge"></i>
            <input
              type="text"
              name="username"
              placeholder="Username petugas / operator"
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
              placeholder="Password Anda"
              required
              autocomplete="current-password"
            >
          </div>
        </div>

        <!-- Info akun demo -->
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;
                    padding:12px 14px;margin-bottom:16px;font-size:12.5px;color:#0369a1;">
          <i class="fas fa-circle-info" style="margin-right:6px;"></i>
          <strong>Akun demo:</strong>
          <span style="margin-left:4px;">
            <code style="background:#e0f2fe;padding:2px 6px;border-radius:4px;">petugas</code>
            atau
            <code style="background:#e0f2fe;padding:2px 6px;border-radius:4px;">operator</code>
            — password: <code style="background:#e0f2fe;padding:2px 6px;border-radius:4px;">admin123</code>
          </span>
        </div>

        <button type="submit" class="btn-login-submit"
                style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);
                       box-shadow:0 4px 16px rgba(29,78,216,.35);">
          <i class="fas fa-right-to-bracket"></i>
          Masuk sebagai Petugas
        </button>
      </form>

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="font-size:13px;color:#9ca3af;">Anda seorang admin?</p>
        <a href="login.php"
           style="display:inline-flex;align-items:center;gap:8px;margin-top:8px;
                  color:#dc2626;font-weight:600;font-size:13px;text-decoration:none;">
          <i class="fas fa-shield-halved"></i>
          Login sebagai Admin
        </a>
      </div>
    </div>

  </div>

</body>
</html>
