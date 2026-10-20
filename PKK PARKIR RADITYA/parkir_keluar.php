<?php
session_start();
if (!isset($_SESSION['user_id']))  { header("Location: login.php");    exit; }
if ($_SESSION['role'] === 'admin') { header("Location: dashboard.php"); exit; }

$platParam = htmlspecialchars($_GET['plat'] ?? '');
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kendaraan Keluar — Radit Parkir</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .detail-box {
      display:none;
      animation: fadeIn .3s ease;
    }
    .detail-box.show { display:block; }
    .info-row {
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:12px 0;
      border-bottom:1px solid #f3f4f6;
    }
    .info-row:last-child { border-bottom:none; }
    .info-row .lbl { font-size:13px; color:#6b7280; }
    .info-row .val { font-size:14px; font-weight:700; color:#1f2937; }
    .biaya-besar {
      font-size:40px;
      font-weight:800;
      color:#dc2626;
      text-align:center;
      padding:20px;
      background:#fff5f5;
      border-radius:14px;
      border:2px solid #fecaca;
      margin:16px 0;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @media print {
      .sidebar,.topbar,.no-print { display:none !important; }
      .main { margin-left:0 !important; padding:0 !important; }
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
        <h1>Kendaraan Keluar</h1>
        <p>Proses pembayaran dan catat kendaraan keluar</p>
      </div>
      <div class="topbar-right no-print">
        <a href="petugas.php" class="btn btn-outline btn-sm">
          <i class="fas fa-arrow-left"></i> Kembali
        </a>
      </div>
    </div>

    <div style="max-width:600px;">

      <!-- CARI KENDARAAN -->
      <div class="card no-print">
        <div class="card-header">
          <h2><i class="fas fa-magnifying-glass"></i> Cari Kendaraan</h2>
        </div>
        <div style="display:flex;gap:10px;">
          <input type="text" id="inputCari" placeholder="Masukkan plat nomor..."
            style="flex:1;font-size:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;"
            value="<?= $platParam ?>" autocomplete="off">
          <button onclick="cariKendaraan()" class="btn btn-primary">
            <i class="fas fa-search"></i> Cari
          </button>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:8px;">
          <i class="fas fa-circle-info"></i>
          Masukkan plat nomor kendaraan yang akan keluar
        </p>
      </div>

      <!-- TIDAK DITEMUKAN -->
      <div id="notFound" style="display:none;" class="no-print">
        <div class="alert alert-error">
          <i class="fas fa-circle-exclamation"></i>
          Kendaraan tidak ditemukan atau sudah keluar.
        </div>
      </div>

      <!-- DETAIL KENDARAAN -->
      <div class="detail-box" id="detailBox">

        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-car-rear"></i> Detail Parkir</h2>
            <span id="badgeJenis" class="badge badge-blue">-</span>
          </div>

          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:32px;font-weight:800;letter-spacing:4px;color:#1f2937;
                        background:#f3f4f6;border-radius:10px;padding:10px 20px;
                        display:inline-block;font-family:monospace;" id="detailPlat">-</div>
          </div>

          <div id="infoRows"></div>

          <!-- Biaya -->
          <div class="biaya-besar" id="biayaBox">
            <div style="font-size:13px;font-weight:600;color:#9ca3af;margin-bottom:4px;">TOTAL BIAYA</div>
            <div id="biayaTampil">Rp 0</div>
          </div>

          <!-- Input biaya — terkunci, tidak bisa diubah -->
          <div class="form-group no-print" style="margin-bottom:16px;">
            <label style="display:flex;align-items:center;gap:6px;">
              Biaya Parkir (Rp)
              <span style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;
                           border-radius:20px;padding:2px 8px;font-weight:600;">
                <i class="fas fa-lock"></i> Rp 5.000/jam — Terkunci
              </span>
            </label>
            <input type="number" id="inputBiaya" min="0"
                   style="font-size:18px;font-weight:700;background:#f3f4f6;cursor:not-allowed;color:#6b7280;"
                   readonly>
          </div>

          <!-- Metode bayar -->
          <div class="form-group no-print" style="margin-bottom:20px;">
            <label>Metode Pembayaran</label>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px;">
              <?php foreach(['Tunai'=>'fa-money-bill-wave','QRIS'=>'fa-qrcode','Transfer'=>'fa-building-columns'] as $m => $ic): ?>
              <label style="cursor:pointer;">
                <input type="radio" name="metode" value="<?= $m ?>" <?= $m==='Tunai'?'checked':'' ?> style="display:none;">
                <div class="metode-btn" style="border:2px solid #e5e7eb;border-radius:10px;padding:12px;
                     text-align:center;transition:all .2s;font-size:13px;font-weight:600;color:#6b7280;">
                  <i class="fas <?= $ic ?>" style="display:block;font-size:20px;margin-bottom:6px;"></i>
                  <?= $m ?>
                </div>
              </label>
              <?php endforeach; ?>
            </div>
          </div>

          <button onclick="prosesKeluar()" class="btn btn-primary no-print"
                  style="width:100%;justify-content:center;padding:14px;font-size:15px;">
            <i class="fas fa-check-circle"></i> Konfirmasi Keluar & Bayar
          </button>
        </div>

      </div>

      <!-- STRUK SUKSES -->
      <div id="strukBox" style="display:none;">
        <div class="card" style="border:2px solid #16a34a;background:#f0fdf4;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:56px;height:56px;background:#16a34a;border-radius:50%;
                        display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
              <i class="fas fa-check" style="color:white;font-size:24px;"></i>
            </div>
            <h3 style="font-size:18px;font-weight:800;color:#166534;">Pembayaran Berhasil!</h3>
          </div>

          <div id="strukIsi"></div>

          <div style="display:flex;gap:10px;margin-top:20px;" class="no-print">
            <button onclick="window.print()" class="btn btn-info" style="flex:1;justify-content:center;">
              <i class="fas fa-print"></i> Cetak Struk
            </button>
            <button onclick="resetKeluar()" class="btn btn-primary" style="flex:1;justify-content:center;">
              <i class="fas fa-plus"></i> Kendaraan Berikutnya
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
// Styling metode bayar
document.querySelectorAll('input[name="metode"]').forEach(radio => {
  radio.addEventListener('change', function() {
    document.querySelectorAll('.metode-btn').forEach(b => {
      b.style.borderColor = '#e5e7eb';
      b.style.background  = 'white';
      b.style.color       = '#6b7280';
    });
    const btn = this.nextElementSibling;
    btn.style.borderColor = '#dc2626';
    btn.style.background  = '#fff5f5';
    btn.style.color       = '#dc2626';
  });
  if (radio.checked) radio.dispatchEvent(new Event('change'));
});

// Auto-cari jika ada param plat dari URL
const platParam = '<?= $platParam ?>';
if (platParam) {
  document.getElementById('inputCari').value = platParam;
  setTimeout(cariKendaraan, 200);
}

document.getElementById('inputCari').addEventListener('input', function() {
  this.value = this.value.toUpperCase();
});
document.getElementById('inputCari').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') cariKendaraan();
});

let kendaraanAktif = null;
let idxAktif = -1;

function cariKendaraan() {
  const plat = document.getElementById('inputCari').value.trim().toUpperCase();
  if (!plat) return;

  const data = JSON.parse(localStorage.getItem('transaksi_data')) || [];
  const idx  = data.findIndex(d => d.plat === plat && !d.keluar);

  document.getElementById('notFound').style.display  = 'none';
  document.getElementById('detailBox').classList.remove('show');
  document.getElementById('strukBox').style.display  = 'none';

  if (idx === -1) {
    document.getElementById('notFound').style.display = 'block';
    return;
  }

  kendaraanAktif = data[idx];
  idxAktif = idx;

  // Hitung durasi & biaya otomatis
  const now = new Date();
  const [h, m] = kendaraanAktif.masuk.split(':').map(Number);
  const masukMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
  const diffMin = Math.max(0, Math.floor((now.getTime() - masukMs) / 60000));
  const jam = Math.floor(diffMin / 60);
  const mnt = diffMin % 60;
  const durasiStr = jam > 0 ? `${jam} jam ${mnt} menit` : `${mnt} menit`;

  // Tarif tetap Rp 5.000/jam untuk semua jenis kendaraan — tidak dapat diubah
  const TARIF_PER_JAM = 5000;
  const jamBulat = Math.max(1, Math.ceil(diffMin / 60));
  const biayaAuto = jamBulat * TARIF_PER_JAM;

  // Tampilkan detail
  const icon = kendaraanAktif.jenis === 'Motor' ? '🏍️' : kendaraanAktif.jenis === 'Mobil' ? '🚗' : '🚛';
  document.getElementById('detailPlat').textContent = kendaraanAktif.plat;
  document.getElementById('badgeJenis').textContent = icon + ' ' + kendaraanAktif.jenis;

  document.getElementById('infoRows').innerHTML = `
    <div class="info-row">
      <span class="lbl"><i class="fas fa-user"></i> Nama Pemilik</span>
      <span class="val">${kendaraanAktif.nama || '-'}</span>
    </div>
    <div class="info-row">
      <span class="lbl"><i class="fas fa-clock"></i> Jam Masuk</span>
      <span class="val">${kendaraanAktif.masuk} WIB</span>
    </div>
    <div class="info-row">
      <span class="lbl"><i class="fas fa-clock"></i> Jam Keluar</span>
      <span class="val">${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB</span>
    </div>
    <div class="info-row">
      <span class="lbl"><i class="fas fa-hourglass-half"></i> Durasi</span>
      <span class="val">${durasiStr}</span>
    </div>
  `;
  document.getElementById('biayaTampil').textContent = 'Rp ' + biayaAuto.toLocaleString('id-ID');
  document.getElementById('inputBiaya').value = biayaAuto;
  document.getElementById('detailBox').classList.add('show');
}

function prosesKeluar() {
  const biaya   = Number(document.getElementById('inputBiaya').value) || 0;
  const metode  = document.querySelector('input[name="metode"]:checked')?.value || 'Tunai';
  const now     = new Date();
  const jamKeluar = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  if (biaya <= 0) {
    alert('Terjadi kesalahan: biaya tidak valid.');
    return;
  }

  // Update data
  const data = JSON.parse(localStorage.getItem('transaksi_data')) || [];
  data[idxAktif].keluar = jamKeluar;
  data[idxAktif].biaya  = biaya;
  data[idxAktif].metode = metode;
  localStorage.setItem('transaksi_data', JSON.stringify(data));

  // Tampilkan struk
  document.getElementById('detailBox').classList.remove('show');
  document.getElementById('strukBox').style.display = 'block';

  const icon = kendaraanAktif.jenis === 'Motor' ? '🏍️' : kendaraanAktif.jenis === 'Mobil' ? '🚗' : '🚛';
  document.getElementById('strukIsi').innerHTML = `
    <div style="background:#f9fafb;border-radius:12px;padding:16px;">
      <div style="text-align:center;margin-bottom:12px;">
        <div style="font-size:28px;font-weight:800;letter-spacing:3px;font-family:monospace;">${kendaraanAktif.plat}</div>
        <div style="color:#6b7280;font-size:13px;">${icon} ${kendaraanAktif.jenis}</div>
      </div>
      <div class="info-row"><span class="lbl">Jam Masuk</span><span class="val">${kendaraanAktif.masuk} WIB</span></div>
      <div class="info-row"><span class="lbl">Jam Keluar</span><span class="val">${jamKeluar} WIB</span></div>
      <div class="info-row"><span class="lbl">Metode Bayar</span><span class="val">${metode}</span></div>
      <div class="info-row">
        <span class="lbl">Tarif</span>
        <span class="val" style="color:#92400e;font-size:12px;">
          <i class="fas fa-lock"></i> Rp 5.000/jam (Terkunci)
        </span>
      </div>
      <div class="info-row" style="border-top:2px solid #e5e7eb;margin-top:8px;padding-top:12px;">
        <span class="lbl" style="font-size:15px;font-weight:700;">Total Dibayar</span>
        <span class="val" style="font-size:22px;color:#16a34a;">Rp ${biaya.toLocaleString('id-ID')}</span>
      </div>
    </div>
  `;

  document.getElementById('strukBox').scrollIntoView({ behavior: 'smooth' });
}

function resetKeluar() {
  document.getElementById('inputCari').value = '';
  document.getElementById('detailBox').classList.remove('show');
  document.getElementById('strukBox').style.display = 'none';
  document.getElementById('notFound').style.display = 'none';
  document.getElementById('inputCari').focus();
  kendaraanAktif = null;
  idxAktif = -1;
}
</script>

</body>
</html>
