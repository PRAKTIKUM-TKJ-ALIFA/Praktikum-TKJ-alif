<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php"); exit;
}
if (isset($_SESSION['role']) && $_SESSION['role'] !== 'admin') {
    header("Location: petugas.php"); exit;
}
?>
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
        <h1>Transaksi Parkir</h1>
        <p>Catat dan kelola transaksi masuk/keluar kendaraan</p>
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
        <h2><i class="fas fa-car-side"></i> Input Transaksi</h2>
      </div>

      <form id="formTransaksi">
        <input type="hidden" id="indexEdit">
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Pelanggan</label>
            <input type="text" id="nama" placeholder="Nama pelanggan" required>
          </div>
          <div class="form-group">
            <label>Plat Nomor</label>
            <input type="text" id="plat" placeholder="B 1234 ABC" required style="text-transform:uppercase;">
          </div>
          <div class="form-group">
            <label>Jenis Kendaraan</label>
            <select id="jenis" required>
              <option value="">-- Pilih --</option>
              <option value="Motor">🏍️ Motor</option>
              <option value="Mobil">🚗 Mobil</option>
              <option value="Truk">🚛 Truk</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jam Masuk</label>
            <input type="time" id="masuk" required>
          </div>
          <div class="form-group">
            <label>Jam Keluar</label>
            <input type="time" id="keluar">
          </div>
          <div class="form-group">
            <label>Biaya Parkir (Rp)</label>
            <input type="number" id="biaya" placeholder="5000" min="0">
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
        <h2><i class="fas fa-table-list"></i> Data Transaksi</h2>
        <span id="jumlahTransaksi" class="badge badge-red">0 data</span>
      </div>

      <div class="table-wrap">
        <table id="tabelTransaksi">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Plat</th>
              <th>Jenis</th>
              <th>Masuk</th>
              <th>Keluar</th>
              <th>Biaya</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="dataBody"></tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script src="assets/js/transaksi.js"></script>
</body>
</html>
