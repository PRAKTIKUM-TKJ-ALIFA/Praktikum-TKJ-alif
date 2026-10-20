<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php"); exit;
}
if (isset($_SESSION['role']) && $_SESSION['role'] !== 'admin') {
    header("Location: petugas.php"); exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pelanggan — Radit Parkir</title>
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
        <h1>Data Pelanggan</h1>
        <p>Kelola data pelanggan parkir</p>
      </div>
      <div class="topbar-right">
        <button onclick="window.print()" class="btn btn-info btn-sm">
          <i class="fas fa-print"></i> Print
        </button>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-user-plus"></i> Tambah / Edit Pelanggan</h2>
      </div>

      <form id="formPelanggan" method="POST">
        <input type="hidden" id="indexEdit" name="indexEdit">
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input type="text" id="nama" name="nama" placeholder="Nama pelanggan" required>
          </div>
          <div class="form-group">
            <label>No. HP</label>
            <input type="text" id="hp" name="hp" placeholder="08xxxxxxxxxx" required>
          </div>
          <div class="form-group">
            <label>Alamat</label>
            <input type="text" id="alamat" name="alamat" placeholder="Alamat lengkap" required>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-floppy-disk"></i> Simpan
          </button>
          <button type="button" id="btnBatal" class="btn btn-warning" style="display:none;">
            <i class="fas fa-xmark"></i> Batal
          </button>
        </div>
      </form>
    </div>

    <!-- TABLE CARD -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-users"></i> Daftar Pelanggan</h2>
        <span id="jumlahPelanggan" class="badge badge-red">0 data</span>
      </div>

      <div class="table-wrap">
        <table id="tabelPelanggan">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>No. HP</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script src="assets/js/script.js"></script>
</body>
</html>
