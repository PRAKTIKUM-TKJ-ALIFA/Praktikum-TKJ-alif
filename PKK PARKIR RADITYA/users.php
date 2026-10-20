<?php
session_start();
if (!isset($_SESSION['user_id'])) { header("Location: login.php"); exit; }

require_once 'config/koneksi.php';

// ══════════════════════════════════════════════════════════════
//  AUTO-MIGRATE: tambah kolom baru jika belum ada
// ══════════════════════════════════════════════════════════════
$existingCols = [];
$colRes = mysqli_query($conn, "SHOW COLUMNS FROM users");
while ($c = mysqli_fetch_assoc($colRes)) $existingCols[] = $c['Field'];

$migrations = [
    'nama'   => "ALTER TABLE users ADD COLUMN nama   VARCHAR(100) NOT NULL DEFAULT '' AFTER id",
    'role'   => "ALTER TABLE users ADD COLUMN role   ENUM('admin','operator','petugas') NOT NULL DEFAULT 'petugas' AFTER password",
    'status' => "ALTER TABLE users ADD COLUMN status ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif' AFTER role",
];
foreach ($migrations as $col => $sql) {
    if (!in_array($col, $existingCols)) {
        mysqli_query($conn, $sql);
    }
}

// Setelah migrate, set role session jika belum ada
if (!isset($_SESSION['role'])) {
    $r = mysqli_query($conn, "SELECT role FROM users WHERE id = " . (int)$_SESSION['user_id']);
    $row = mysqli_fetch_assoc($r);
    $_SESSION['role'] = $row['role'] ?? 'admin';
}

// Hanya admin yang boleh akses
if ($_SESSION['role'] !== 'admin') { header("Location: dashboard.php"); exit; }

// ══════════════════════════════════════════════════════════════
//  AKSI
// ══════════════════════════════════════════════════════════════
$msg     = '';
$msgType = '';
$editUser = null;

// HAPUS
if (isset($_GET['hapus'])) {
    $id = (int)$_GET['hapus'];
    if ($id === (int)$_SESSION['user_id']) {
        $msg = 'Tidak bisa menghapus akun sendiri.';
        $msgType = 'error';
    } else {
        mysqli_query($conn, "DELETE FROM users WHERE id = $id");
        $msg = 'User berhasil dihapus.';
        $msgType = 'success';
    }
}

// TOGGLE STATUS
if (isset($_GET['toggle'])) {
    $id = (int)$_GET['toggle'];
    mysqli_query($conn, "UPDATE users SET status = IF(status='aktif','nonaktif','aktif') WHERE id = $id");
    header("Location: users.php"); exit;
}

// AMBIL DATA EDIT
if (isset($_GET['edit'])) {
    $id  = (int)$_GET['edit'];
    $res = mysqli_query($conn, "SELECT * FROM users WHERE id = $id LIMIT 1");
    $editUser = mysqli_fetch_assoc($res);
}

// SIMPAN (TAMBAH / UPDATE)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id       = (int)($_POST['id'] ?? 0);
    $nama     = trim($_POST['nama'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $role     = $_POST['role']   ?? 'petugas';
    $status   = $_POST['status'] ?? 'aktif';
    $password = $_POST['password'] ?? '';

    if ($nama === '' || $username === '') {
        $msg = 'Nama dan username wajib diisi.';
        $msgType = 'error';
    } else {
        if ($id > 0) {
            // UPDATE
            if ($password !== '') {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = mysqli_prepare($conn,
                    "UPDATE users SET nama=?, username=?, password=?, role=?, status=? WHERE id=?");
                mysqli_stmt_bind_param($stmt, 'sssssi', $nama, $username, $hash, $role, $status, $id);
            } else {
                $stmt = mysqli_prepare($conn,
                    "UPDATE users SET nama=?, username=?, role=?, status=? WHERE id=?");
                mysqli_stmt_bind_param($stmt, 'ssssi', $nama, $username, $role, $status, $id);
            }
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
            $msg = 'Data user berhasil diperbarui.';
            $msgType = 'success';
            $editUser = null;
        } else {
            // INSERT
            if ($password === '') {
                $msg = 'Password wajib diisi untuk user baru.';
                $msgType = 'error';
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = mysqli_prepare($conn,
                    "INSERT INTO users (nama, username, password, role, status) VALUES (?,?,?,?,?)");
                mysqli_stmt_bind_param($stmt, 'sssss', $nama, $username, $hash, $role, $status);
                if (mysqli_stmt_execute($stmt)) {
                    $msg = "User <strong>$username</strong> berhasil ditambahkan.";
                    $msgType = 'success';
                } else {
                    $msg = 'Username sudah digunakan, coba yang lain.';
                    $msgType = 'error';
                }
                mysqli_stmt_close($stmt);
            }
        }
    }
}

// AMBIL SEMUA USER
$users = [];
$res = mysqli_query($conn, "SELECT * FROM users ORDER BY id ASC");
while ($r = mysqli_fetch_assoc($res)) $users[] = $r;
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manajemen User — Radit Parkir</title>
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
        <h1>Manajemen User</h1>
        <p>Kelola akun login sistem parkir</p>
      </div>
    </div>

    <!-- ALERT -->
    <?php if ($msg): ?>
    <div class="alert alert-<?= $msgType === 'success' ? 'success' : 'error' ?>">
      <i class="fas fa-<?= $msgType === 'success' ? 'circle-check' : 'circle-exclamation' ?>"></i>
      <?= $msg ?>
    </div>
    <?php endif; ?>

    <!-- FORM CARD -->
    <div class="card">
      <div class="card-header">
        <h2>
          <i class="fas fa-<?= $editUser ? 'user-pen' : 'user-plus' ?>"></i>
          <?= $editUser ? 'Edit User' : 'Tambah User Baru' ?>
        </h2>
        <?php if ($editUser): ?>
          <a href="users.php" class="btn btn-outline btn-sm">
            <i class="fas fa-xmark"></i> Batal Edit
          </a>
        <?php endif; ?>
      </div>

      <form method="POST" action="users.php">
        <input type="hidden" name="id" value="<?= $editUser['id'] ?? 0 ?>">

        <div class="form-grid">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input type="text" name="nama" placeholder="Nama lengkap"
              value="<?= htmlspecialchars($editUser['nama'] ?? '') ?>" required>
          </div>
          <div class="form-group">
            <label>Username *</label>
            <input type="text" name="username" placeholder="Username login"
              value="<?= htmlspecialchars($editUser['username'] ?? '') ?>" required>
          </div>
          <div class="form-group">
            <label><?= $editUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *' ?></label>
            <input type="password" name="password" placeholder="Min. 6 karakter"
              <?= $editUser ? '' : 'required' ?>>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select name="role">
              <?php
                $curRole = $editUser['role'] ?? 'petugas';
                $roles   = ['admin' => 'Admin', 'operator' => 'Operator', 'petugas' => 'Petugas'];
                foreach ($roles as $val => $label):
              ?>
              <option value="<?= $val ?>" <?= $curRole === $val ? 'selected' : '' ?>>
                <?= $label ?>
              </option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="aktif"    <?= ($editUser['status'] ?? 'aktif') === 'aktif'    ? 'selected' : '' ?>>Aktif</option>
              <option value="nonaktif" <?= ($editUser['status'] ?? '') === 'nonaktif' ? 'selected' : '' ?>>Nonaktif</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">
          <i class="fas fa-floppy-disk"></i>
          <?= $editUser ? 'Simpan Perubahan' : 'Tambah User' ?>
        </button>
      </form>
    </div>

    <!-- TABLE CARD -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-users"></i> Daftar User</h2>
        <span class="badge badge-red"><?= count($users) ?> user</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($users)): ?>
            <tr>
              <td colspan="7" style="text-align:center;padding:32px;color:#9ca3af;">
                <i class="fas fa-users" style="font-size:28px;display:block;margin-bottom:8px;opacity:.3;"></i>
                Belum ada user
              </td>
            </tr>
            <?php else: ?>
            <?php foreach ($users as $u):
              // Nilai default aman jika kolom belum ada
              $uNama   = $u['nama']   ?? $u['username'];
              $uRole   = $u['role']   ?? 'admin';
              $uStatus = $u['status'] ?? 'aktif';

              $roleClass = ['admin' => 'badge-red', 'operator' => 'badge-blue', 'petugas' => 'badge-green'];
              $roleIcon  = ['admin' => 'fa-shield-halved', 'operator' => 'fa-headset', 'petugas' => 'fa-id-badge'];
              $rClass    = $roleClass[$uRole] ?? 'badge-gray';
              $rIcon     = $roleIcon[$uRole]  ?? 'fa-user';
            ?>
            <tr>
              <td style="color:#9ca3af;font-size:12px;">#<?= $u['id'] ?></td>

              <td>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:34px;height:34px;border-radius:50%;
                              background:linear-gradient(135deg,#dc2626,#ef4444);
                              display:flex;align-items:center;justify-content:center;
                              color:white;font-weight:700;font-size:13px;flex-shrink:0;">
                    <?= strtoupper(substr($uNama, 0, 1)) ?>
                  </div>
                  <strong><?= htmlspecialchars($uNama) ?></strong>
                  <?php if ((int)$u['id'] === (int)$_SESSION['user_id']): ?>
                    <span class="badge badge-blue" style="font-size:10px;">Anda</span>
                  <?php endif; ?>
                </div>
              </td>

              <td><code><?= htmlspecialchars($u['username']) ?></code></td>

              <td>
                <span class="badge <?= $rClass ?>">
                  <i class="fas <?= $rIcon ?>"></i>
                  <?= ucfirst($uRole) ?>
                </span>
              </td>

              <td>
                <a href="users.php?toggle=<?= $u['id'] ?>" title="Klik untuk toggle" style="text-decoration:none;">
                  <span class="badge <?= $uStatus === 'aktif' ? 'badge-green' : 'badge-gray' ?>">
                    <i class="fas fa-circle" style="font-size:7px;"></i>
                    <?= ucfirst($uStatus) ?>
                  </span>
                </a>
              </td>

              <td style="font-size:12px;color:#9ca3af;">
                <?= date('d M Y', strtotime($u['created_at'])) ?>
              </td>

              <td>
                <a href="users.php?edit=<?= $u['id'] ?>" class="btn btn-warning btn-sm">
                  <i class="fas fa-pen"></i>
                </a>
                <?php if ((int)$u['id'] !== (int)$_SESSION['user_id']): ?>
                <a href="users.php?hapus=<?= $u['id'] ?>"
                   class="btn btn-danger btn-sm"
                   style="margin-left:6px;"
                   onclick="return confirm('Hapus user <?= htmlspecialchars($u['username'], ENT_QUOTES) ?>?')">
                  <i class="fas fa-trash"></i>
                </a>
                <?php endif; ?>
              </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>

      <!-- Keterangan role -->
      <div style="margin-top:16px;display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#6b7280;">
        <span>
          <span class="badge badge-red" style="font-size:11px;">
            <i class="fas fa-shield-halved"></i> Admin
          </span> — Akses penuh
        </span>
        <span>
          <span class="badge badge-blue" style="font-size:11px;">
            <i class="fas fa-headset"></i> Operator
          </span> — Kelola transaksi
        </span>
        <span>
          <span class="badge badge-green" style="font-size:11px;">
            <i class="fas fa-id-badge"></i> Petugas
          </span> — Input data
        </span>
      </div>
    </div>

  </div>
</div>

</body>
</html>
