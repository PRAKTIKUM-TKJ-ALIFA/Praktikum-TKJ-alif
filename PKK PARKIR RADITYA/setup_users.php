<?php
/**
 * setup_users.php
 * Jalankan SEKALI di browser: http://localhost/Kiro-PKK/PKK%20PARKIR%20RADITYA/setup_users.php
 * Setelah selesai, hapus file ini.
 */
require_once 'config/koneksi.php';

$errors  = [];
$success = [];

// ── 1. Buat / update struktur tabel ──────────────────────────
$sqls = [
  "CREATE TABLE IF NOT EXISTS `users` (
      `id`         INT          NOT NULL AUTO_INCREMENT,
      `nama`       VARCHAR(100) NOT NULL DEFAULT '',
      `username`   VARCHAR(50)  NOT NULL UNIQUE,
      `password`   VARCHAR(255) NOT NULL,
      `role`       ENUM('admin','operator','petugas') NOT NULL DEFAULT 'petugas',
      `status`     ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
      `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

  // Tambah kolom baru jika belum ada (MySQL 8+ / MariaDB 10.3+)
  "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `nama`   VARCHAR(100) NOT NULL DEFAULT '' AFTER `id`",
  "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `role`   ENUM('admin','operator','petugas') NOT NULL DEFAULT 'petugas' AFTER `password`",
  "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif' AFTER `role`",
];

foreach ($sqls as $sql) {
    if (mysqli_query($conn, $sql)) {
        $success[] = "OK: " . substr(trim($sql), 0, 60) . "...";
    } else {
        // Abaikan error "Duplicate column" — kolom sudah ada
        if (strpos(mysqli_error($conn), 'Duplicate column') === false) {
            $errors[] = mysqli_error($conn);
        }
    }
}

// ── 2. Seed akun default ─────────────────────────────────────
$accounts = [
    ['Administrator',  'admin',    'admin123', 'admin'],
    ['Operator Satu',  'operator', 'admin123', 'operator'],
    ['Petugas Parkir', 'petugas',  'admin123', 'petugas'],
];

foreach ($accounts as [$nama, $username, $plain, $role]) {
    $hash = password_hash($plain, PASSWORD_DEFAULT);
    $stmt = mysqli_prepare($conn,
        "INSERT INTO users (nama, username, password, role, status)
         VALUES (?, ?, ?, ?, 'aktif')
         ON DUPLICATE KEY UPDATE
             nama     = VALUES(nama),
             password = VALUES(password),
             role     = VALUES(role),
             status   = 'aktif'"
    );
    mysqli_stmt_bind_param($stmt, 'ssss', $nama, $username, $hash, $role);
    if (mysqli_stmt_execute($stmt)) {
        $success[] = "Akun <strong>$username</strong> ($role) siap — password: <code>$plain</code>";
    } else {
        $errors[] = "Gagal insert $username: " . mysqli_stmt_error($stmt);
    }
    mysqli_stmt_close($stmt);
}

// ── 3. Ambil semua user untuk ditampilkan ────────────────────
$rows = [];
$res  = mysqli_query($conn, "SELECT id, nama, username, role, status, created_at FROM users ORDER BY id");
while ($r = mysqli_fetch_assoc($res)) $rows[] = $r;
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Setup Users — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    body { display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; background:#f3f4f6; }
    .wrap { width:100%; max-width:860px; }
    code { background:#f1f5f9; padding:2px 7px; border-radius:5px; font-size:13px; color:#dc2626; }
    .log { background:#1e293b; color:#94a3b8; border-radius:10px; padding:16px 20px; font-size:12.5px; line-height:1.9; margin-bottom:20px; }
    .log .ok  { color:#4ade80; }
    .log .err { color:#f87171; }
    .role-admin    { background:#fee2e2; color:#dc2626; }
    .role-operator { background:#dbeafe; color:#2563eb; }
    .role-petugas  { background:#f0fdf4; color:#16a34a; }
    .status-aktif  { background:#dcfce7; color:#16a34a; }
  </style>
</head>
<body>
<div class="wrap">

  <div class="card" style="border-left:5px solid #dc2626;">
    <div class="card-header">
      <h2><i class="fas fa-database"></i> Setup Tabel Users</h2>
    </div>

    <!-- Log -->
    <div class="log">
      <?php foreach ($success as $s): ?>
        <div class="ok"><i class="fas fa-check"></i> <?= $s ?></div>
      <?php endforeach; ?>
      <?php foreach ($errors as $e): ?>
        <div class="err"><i class="fas fa-xmark"></i> <?= htmlspecialchars($e) ?></div>
      <?php endforeach; ?>
    </div>

    <!-- Tabel hasil -->
    <h3 style="font-size:15px;font-weight:700;color:#374151;margin-bottom:14px;">
      <i class="fas fa-users" style="color:#dc2626;"></i>
      Daftar Akun (<?= count($rows) ?> user)
    </h3>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Username</th>
            <th>Password Login</th>
            <th>Role</th>
            <th>Status</th>
            <th>Dibuat</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($rows as $u): ?>
          <tr>
            <td><?= $u['id'] ?></td>
            <td><strong><?= htmlspecialchars($u['nama']) ?></strong></td>
            <td><code><?= htmlspecialchars($u['username']) ?></code></td>
            <td><code>admin123</code></td>
            <td>
              <span class="badge role-<?= $u['role'] ?>">
                <?= ucfirst($u['role']) ?>
              </span>
            </td>
            <td>
              <span class="badge status-<?= $u['status'] ?>">
                <?= ucfirst($u['status']) ?>
              </span>
            </td>
            <td style="font-size:12px;color:#9ca3af;">
              <?= date('d M Y H:i', strtotime($u['created_at'])) ?>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <div style="margin-top:24px;padding:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;font-size:13px;color:#92400e;">
      <i class="fas fa-triangle-exclamation"></i>
      <strong>Penting:</strong> Setelah setup selesai, <strong>hapus file ini</strong> agar tidak bisa diakses orang lain.
    </div>

    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
      <a href="login.php" class="btn btn-primary">
        <i class="fas fa-right-to-bracket"></i> Ke Halaman Login
      </a>
      <a href="<?= $_SERVER['PHP_SELF'] ?>" class="btn btn-outline">
        <i class="fas fa-rotate"></i> Jalankan Ulang
      </a>
    </div>
  </div>

</div>
</body>
</html>
