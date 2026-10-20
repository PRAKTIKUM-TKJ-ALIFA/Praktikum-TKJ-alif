<?php
/**
 * cek_role.php — Cek & perbaiki role user di database
 * Hapus file ini setelah selesai digunakan!
 */
require_once 'config/koneksi.php';

// Tampilkan semua user beserta role-nya
$res = mysqli_query($conn, "SELECT id, username, nama, role, status FROM users ORDER BY id");
$users = [];
while ($r = mysqli_fetch_assoc($res)) $users[] = $r;

// Proses update role jika ada POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['user_id'], $_POST['new_role'])) {
    $id   = (int)$_POST['user_id'];
    $role = $_POST['new_role'];
    mysqli_query($conn, "UPDATE users SET role='$role' WHERE id=$id");
    header("Location: cek_role.php?updated=1");
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Cek Role User</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>body{padding:30px;background:#f3f4f6;}</style>
</head>
<body>
<div style="max-width:700px;margin:auto;">

  <div class="card">
    <div class="card-header">
      <h2><i class="fas fa-users-gear"></i> Cek & Perbaiki Role User</h2>
    </div>

    <?php if (isset($_GET['updated'])): ?>
    <div class="alert alert-success"><i class="fas fa-check"></i> Role berhasil diperbarui!</div>
    <?php endif; ?>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Nama</th><th>Role Saat Ini</th><th>Ubah Role</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($users as $u): ?>
          <tr>
            <td><?= $u['id'] ?></td>
            <td><code><?= htmlspecialchars($u['username']) ?></code></td>
            <td><?= htmlspecialchars($u['nama'] ?? '-') ?></td>
            <td>
              <?php
                $rc = ['admin'=>'badge-red','operator'=>'badge-blue','petugas'=>'badge-green'];
                $role = $u['role'] ?? 'petugas';
              ?>
              <span class="badge <?= $rc[$role] ?? 'badge-gray' ?>"><?= ucfirst($role) ?></span>
            </td>
            <td>
              <form method="POST" style="display:flex;gap:8px;align-items:center;">
                <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                <select name="new_role" style="padding:6px 10px;border-radius:7px;border:1px solid #ddd;font-size:13px;">
                  <option value="admin"    <?= $role==='admin'    ?'selected':'' ?>>Admin</option>
                  <option value="operator" <?= $role==='operator' ?'selected':'' ?>>Operator</option>
                  <option value="petugas"  <?= $role==='petugas'  ?'selected':'' ?>>Petugas</option>
                </select>
                <button type="submit" class="btn btn-primary btn-sm">
                  <i class="fas fa-floppy-disk"></i> Simpan
                </button>
              </form>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <div style="margin-top:20px;padding:14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;font-size:13px;color:#92400e;">
      <i class="fas fa-triangle-exclamation"></i>
      <strong>Hapus file ini</strong> setelah selesai memperbaiki role.
    </div>

    <div style="margin-top:14px;display:flex;gap:10px;">
      <a href="login.php" class="btn btn-primary btn-sm"><i class="fas fa-right-to-bracket"></i> Ke Login</a>
    </div>
  </div>

</div>
</body>
</html>
