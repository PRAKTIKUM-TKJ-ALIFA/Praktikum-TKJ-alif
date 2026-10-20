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
        <h1>Data Kendaraan</h1>
        <p>Kelola data kendaraan yang terdaftar</p>
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
        <h2><i class="fas fa-car-rear"></i> Tambah / Edit Kendaraan</h2>
      </div>

      <form id="formKendaraan">
        <input type="hidden" id="indexEdit">
        <div class="form-grid">
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
            <label>Merek</label>
            <input type="text" id="merek" placeholder="Honda, Toyota, dll">
          </div>
          <div class="form-group">
            <label>Warna</label>
            <input type="text" id="warna" placeholder="Merah, Hitam, dll">
          </div>
          <div class="form-group">
            <label>Nama Pemilik</label>
            <input type="text" id="pemilik" placeholder="Nama pemilik kendaraan">
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
        <h2><i class="fas fa-car"></i> Daftar Kendaraan</h2>
        <span id="jumlahKendaraan" class="badge badge-red">0 data</span>
      </div>

      <div class="table-wrap">
        <table id="tabelKendaraan">
          <thead>
            <tr>
              <th>No</th>
              <th>Plat Nomor</th>
              <th>Jenis</th>
              <th>Merek</th>
              <th>Warna</th>
              <th>Pemilik</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="dataBodyKendaraan"></tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script>
// ── Kendaraan JS (localStorage) ──
const KEY = 'kendaraan_data';
let data = JSON.parse(localStorage.getItem(KEY)) || [];
let editIndex = -1;

const form    = document.getElementById('formKendaraan');
const tbody   = document.getElementById('dataBodyKendaraan');
const btnBatal = document.getElementById('btnBatal');
const counter = document.getElementById('jumlahKendaraan');

function save() { localStorage.setItem(KEY, JSON.stringify(data)); }

function render() {
  tbody.innerHTML = '';
  counter.textContent = data.length + ' data';
  data.forEach((d, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><code>${d.plat}</code></td>
        <td>${d.jenis}</td>
        <td>${d.merek || '-'}</td>
        <td>${d.warna || '-'}</td>
        <td>${d.pemilik || '-'}</td>
        <td>
          <button onclick="edit(${i})" class="btn btn-warning btn-sm"><i class="fas fa-pen"></i></button>
          <button onclick="hapus(${i})" class="btn btn-danger btn-sm" style="margin-left:6px;"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  });
}

function edit(i) {
  editIndex = i;
  const d = data[i];
  document.getElementById('plat').value    = d.plat;
  document.getElementById('jenis').value   = d.jenis;
  document.getElementById('merek').value   = d.merek;
  document.getElementById('warna').value   = d.warna;
  document.getElementById('pemilik').value = d.pemilik;
  document.getElementById('indexEdit').value = i;
  btnBatal.style.display = 'inline-flex';
}

function hapus(i) {
  if (confirm('Hapus data kendaraan ini?')) {
    data.splice(i, 1);
    save(); render();
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const obj = {
    plat:    document.getElementById('plat').value.toUpperCase(),
    jenis:   document.getElementById('jenis').value,
    merek:   document.getElementById('merek').value,
    warna:   document.getElementById('warna').value,
    pemilik: document.getElementById('pemilik').value,
  };
  if (editIndex >= 0) { data[editIndex] = obj; editIndex = -1; }
  else { data.push(obj); }
  save(); render(); form.reset();
  btnBatal.style.display = 'none';
});

btnBatal.addEventListener('click', () => {
  form.reset(); editIndex = -1;
  btnBatal.style.display = 'none';
});

render();
</script>
</body>
</html>
