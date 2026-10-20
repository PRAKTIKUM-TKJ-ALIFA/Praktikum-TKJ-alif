<?php
session_start();
if (!isset($_SESSION['user_id']))  { header("Location: login.php");    exit; }
if ($_SESSION['role'] === 'admin') { header("Location: dashboard.php"); exit; }
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kendaraan Masuk — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .tiket {
      display:none;
      background: white;
      border: 2px dashed #dc2626;
      border-radius: 16px;
      padding: 28px;
      text-align: center;
      margin-top: 20px;
      animation: fadeIn .4s ease;
    }
    .tiket.show { display: block; }
    .tiket .plat-besar {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #1f2937;
      background: #f3f4f6;
      border-radius: 10px;
      padding: 12px 24px;
      display: inline-block;
      margin: 12px 0;
      font-family: monospace;
    }
    .tiket-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
      text-align: left;
    }
    .tiket-item {
      background: #f9fafb;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .tiket-item .label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #9ca3af;
      letter-spacing: .5px;
    }
    .tiket-item .value {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin-top: 2px;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @media print {
      .sidebar, .topbar, .no-print { display: none !important; }
      .main { margin-left: 0 !important; padding: 0 !important; }
      .tiket { border: 2px solid #dc2626; display: block !important; }
    }
  </style>
</head>
<body>

<div style="display:flex;">
  <?php include 'layout/sidebar_petugas.php'; ?>

  <div class="main" style="flex:1;">

    <!-- TOPBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <h1>Kendaraan Masuk</h1>
        <p>Catat kendaraan yang baru masuk area parkir</p>
      </div>
      <div class="topbar-right no-print">
        <a href="petugas.php" class="btn btn-outline btn-sm">
          <i class="fas fa-arrow-left"></i> Kembali
        </a>
      </div>
    </div>

    <div style="max-width:600px;">

      <!-- FORM MASUK -->
      <div class="card no-print">
        <div class="card-header">
          <h2><i class="fas fa-car-side"></i> Form Kendaraan Masuk</h2>
        </div>

        <form id="formMasuk">
          <div class="form-grid">
            <div class="form-group" style="grid-column:1/-1;">
              <label>Plat Nomor *</label>
              <input type="text" id="plat" placeholder="Contoh: B 1234 ABC"
                style="font-size:20px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-align:center;"
                required autocomplete="off">
            </div>
            <div class="form-group">
              <label>Jenis Kendaraan *</label>
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
            <div class="form-group" style="grid-column:1/-1;">
              <label>Nama Pemilik (opsional)</label>
              <input type="text" id="nama" placeholder="Nama pemilik kendaraan">
            </div>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="submit" class="btn btn-primary" style="flex:1;justify-content:center;padding:14px;">
              <i class="fas fa-car-side"></i> Catat Masuk & Cetak Tiket
            </button>
            <button type="button" onclick="resetForm()" class="btn btn-outline">
              <i class="fas fa-rotate-left"></i> Reset
            </button>
          </div>
        </form>
      </div>

      <!-- TIKET -->
      <div class="tiket" id="tiket">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#dc2626,#ef4444);
                      border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-square-parking" style="color:white;font-size:16px;"></i>
          </div>
          <div style="text-align:left;">
            <div style="font-weight:800;font-size:16px;color:#1f2937;">RADIT PARKIR</div>
            <div style="font-size:11px;color:#9ca3af;">Tiket Parkir Masuk</div>
          </div>
        </div>

        <div class="plat-besar" id="tiketPlat">-</div>

        <div class="tiket-grid">
          <div class="tiket-item">
            <div class="label">Jenis Kendaraan</div>
            <div class="value" id="tiketJenis">-</div>
          </div>
          <div class="tiket-item">
            <div class="label">Jam Masuk</div>
            <div class="value" id="tiketMasuk">-</div>
          </div>
          <div class="tiket-item">
            <div class="label">Nama Pemilik</div>
            <div class="value" id="tiketNama">-</div>
          </div>
          <div class="tiket-item">
            <div class="label">Petugas</div>
            <div class="value"><?= htmlspecialchars($_SESSION['nama'] ?? $_SESSION['username']) ?></div>
          </div>
        </div>

        <div style="font-size:11px;color:#9ca3af;margin-top:8px;">
          Simpan tiket ini untuk proses keluar
        </div>

        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;" class="no-print">
          <button onclick="window.print()" class="btn btn-info btn-sm">
            <i class="fas fa-print"></i> Cetak Tiket
          </button>
          <button onclick="resetForm()" class="btn btn-primary btn-sm">
            <i class="fas fa-plus"></i> Kendaraan Berikutnya
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
// Set jam masuk otomatis ke sekarang
const now = new Date();
document.getElementById('masuk').value =
  String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

document.getElementById('plat').addEventListener('input', function() {
  this.value = this.value.toUpperCase();
});

document.getElementById('formMasuk').addEventListener('submit', function(e) {
  e.preventDefault();

  const plat  = document.getElementById('plat').value.trim().toUpperCase();
  const jenis = document.getElementById('jenis').value;
  const masuk = document.getElementById('masuk').value;
  const nama  = document.getElementById('nama').value.trim() || '-';

  if (!plat || !jenis || !masuk) return;

  // Cek duplikat plat yang masih aktif
  const data = JSON.parse(localStorage.getItem('transaksi_data')) || [];
  const duplikat = data.find(d => d.plat === plat && !d.keluar);
  if (duplikat) {
    alert('⚠️ Kendaraan dengan plat ' + plat + ' masih tercatat parkir!\nProses keluar dulu sebelum masuk lagi.');
    return;
  }

  // Simpan ke localStorage
  data.push({ plat, jenis, masuk, nama, keluar: '', biaya: '' });
  localStorage.setItem('transaksi_data', JSON.stringify(data));

  // Tampilkan tiket
  const icon = jenis === 'Motor' ? '🏍️' : jenis === 'Mobil' ? '🚗' : '🚛';
  document.getElementById('tiketPlat').textContent  = plat;
  document.getElementById('tiketJenis').textContent = icon + ' ' + jenis;
  document.getElementById('tiketMasuk').textContent = masuk + ' WIB';
  document.getElementById('tiketNama').textContent  = nama;
  document.getElementById('tiket').classList.add('show');

  // Scroll ke tiket
  document.getElementById('tiket').scrollIntoView({ behavior: 'smooth' });
});

function resetForm() {
  document.getElementById('formMasuk').reset();
  document.getElementById('tiket').classList.remove('show');
  const now = new Date();
  document.getElementById('masuk').value =
    String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  document.getElementById('plat').focus();
}
</script>

</body>
</html>
