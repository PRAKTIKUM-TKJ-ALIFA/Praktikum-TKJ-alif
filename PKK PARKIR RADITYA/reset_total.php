<?php
/**
 * reset_total.php
 * Reset semua user dan buat ulang dari awal
 * Hapus file ini setelah selesai!
 */
require_once 'config/koneksi.php';

$log = [];

// 1. Buat tabel users dari awal (drop & recreate)
mysqli_query($conn, "DROP TABLE IF EXISTS users");
$log[] = ['ok', 'Tabel users dihapus'];

$sql = "CREATE TABLE users (
    id         INT          NOT NULL AUTO_INCREMENT,
    nama       VARCHAR(100) NOT NULL DEFAULT '',
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('admin','operator','petugas') NOT NULL DEFAULT 'petugas',
    status     ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (mysqli_query($conn, $sql)) {
    $log[] = ['ok', 'Tabel users dibuat ulang'];
} else {
    $log[] = ['err', 'Gagal buat tabel: ' . mysqli_error($conn)];
}

// 2. Insert akun
$akun = [
    ['Administrator', 'admin',    'admin123', 'admin'],
    ['Operator Satu', 'operator', 'admin123', 'operator'],
    ['Petugas Parkir','petugas',  'admin123', 'petugas'],
];

foreach ($akun as [$nama, $uname, $plain, $role]) {
    $hash = password_hash($plain, PASSWORD_BCRYPT);
    $stmt = mysqli_prepare($conn,
        "INSERT INTO users (nama, username, password, role, status) VALUES (?,?,?,?,'aktif')");
    mysqli_stmt_bind_param($stmt, 'ssss', $nama, $uname, $hash, $role);
    if (mysqli_stmt_execute($stmt)) {
        $log[] = ['ok', "Akun <b>$uname</b> ($role) dibuat — password: <code>$plain</code>"];
    } else {
        $log[] = ['err', "Gagal buat $uname: " . mysqli_stmt_error($stmt)];
    }
    mysqli_stmt_close($stmt);
}

// 3. Verifikasi password langsung
$log[] = ['info', '--- Verifikasi password ---'];
foreach ($akun as [$nama, $uname, $plain, $role]) {
    $r = mysqli_query($conn, "SELECT password FROM users WHERE username='$uname'");
    $row = mysqli_fetch_assoc($r);
    if ($row && password_verify($plain, $row['password'])) {
        $log[] = ['ok', "Verifikasi <b>$uname</b>: password_verify = TRUE ✅"];
    } else {
        $log[] = ['err', "Verifikasi <b>$uname</b>: password_verify = FALSE ❌"];
    }
}

// 4. Tampilkan semua user
$users = [];
$res = mysqli_query($conn, "SELECT id, nama, username, role, status FROM users");
while ($r = mysqli_fetch_assoc($res)) $users[] = $r;
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Reset Total — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    body { padding: 30px; background: #f3f4f6; }
    .log { background: #1e293b; color: #94a3b8; border-radius: 12px; padding: 16px 20px;
           font-size: 13px; line-height: 2; margin-bottom: 20px; font-family: monospace; }
    .log .ok   { color: #4ade80; }
    .log .err  { color: #f87171; }
    .log .info { color: #60a5fa; }
    code { background: #334155; padding: 2px 7px; border-radius: 4px; color: #fbbf24; }
  </style>
</head>
<body>
<div style="max-width: 720px; margin: auto;">

  <div class="card">
    <div class="card-header">
      <h2><i class="fas fa-rotate"></i> Reset Total Berhasil</h2>
    </div>

    <!-- Log -->
    <div class="log">
      <?php foreach ($log as [$type, $msg]): ?>
        <div class="<?= $type ?>">
          <?= $type === 'ok' ? '✅' : ($type === 'err' ? '❌' : 'ℹ️') ?>
          <?= $msg ?>
        </div>
      <?php endforeach; ?>
    </div>

    <!-- Tabel user -->
    <h3 style="font-size:15px;font-weight:700;color:#374151;margin-bottom:12px;">
      <i class="fas fa-users" style="color:#dc2626;"></i> Akun yang Tersedia
    </h3>
    <div class="table-wrap" style="margin-bottom:20px;">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $roleClass = ['admin'=>'badge-red','operator'=>'badge-blue','petugas'=>'badge-green'];
          foreach ($users as $u):
          ?>
          <tr>
            <td><?= $u['id'] ?></td>
            <td><?= htmlspecialchars($u['nama']) ?></td>
            <td><code style="background:#f1f5f9;color:#dc2626;padding:2px 8px;border-radius:5px;">
              <?= htmlspecialchars($u['username']) ?>
            </code></td>
            <td><code style="background:#f1f5f9;color:#16a34a;padding:2px 8px;border-radius:5px;">
              admin123
            </code></td>
            <td>
              <span class="badge <?= $roleClass[$u['role']] ?? 'badge-gray' ?>">
                <?= ucfirst($u['role']) ?>
              </span>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;
                padding:14px 16px;font-size:13px;color:#92400e;margin-bottom:16px;">
      <i class="fas fa-triangle-exclamation"></i>
      <strong>Hapus file reset_total.php</strong> setelah selesai!
    </div>

    <a href="login.php" class="btn btn-primary">
      <i class="fas fa-right-to-bracket"></i> Ke Halaman Login
    </a>
  </div>

</div>
</body>
</html>
