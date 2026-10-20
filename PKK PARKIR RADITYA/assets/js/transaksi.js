// ── Transaksi — localStorage CRUD ──
const KEY_TX = 'transaksi_data';
let dataTx  = JSON.parse(localStorage.getItem(KEY_TX)) || [];
let editIdx = -1;

const form     = document.getElementById('formTransaksi');
const tbody    = document.getElementById('dataBody');
const btnBatal = document.getElementById('btnBatal');
const counter  = document.getElementById('jumlahTransaksi');

function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function saveTx() {
  localStorage.setItem(KEY_TX, JSON.stringify(dataTx));
}

function renderTx() {
  tbody.innerHTML = '';
  if (counter) counter.textContent = dataTx.length + ' data';

  dataTx.forEach((d, i) => {
    const jenisIcon = d.jenis === 'Motor' ? '🏍️' : d.jenis === 'Mobil' ? '🚗' : '🚛';
    const badgeClass = d.keluar ? 'badge-green' : 'badge-amber';
    const statusLabel = d.keluar ? 'Selesai' : 'Parkir';

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${d.nama}</strong></td>
        <td><code>${d.plat}</code></td>
        <td>${jenisIcon} ${d.jenis}</td>
        <td>${d.masuk}</td>
        <td>${d.keluar || '<span class="badge badge-amber">Masih parkir</span>'}</td>
        <td><strong>${d.biaya ? formatRupiah(d.biaya) : '-'}</strong></td>
        <td>
          <button onclick="editTx(${i})" class="btn btn-warning btn-sm">
            <i class="fas fa-pen"></i>
          </button>
          <button onclick="hapusTx(${i})" class="btn btn-danger btn-sm" style="margin-left:6px;">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
  });
}

window.editTx = function(i) {
  const d = dataTx[i];
  document.getElementById('nama').value  = d.nama;
  document.getElementById('plat').value  = d.plat;
  document.getElementById('jenis').value = d.jenis;
  document.getElementById('masuk').value = d.masuk;
  document.getElementById('keluar').value = d.keluar || '';
  document.getElementById('biaya').value = d.biaya || '';
  document.getElementById('indexEdit').value = i;
  editIdx = i;
  btnBatal.style.display = 'inline-flex';
  document.getElementById('nama').focus();
};

window.hapusTx = function(i) {
  if (confirm('Hapus transaksi ini?')) {
    dataTx.splice(i, 1);
    saveTx();
    renderTx();
  }
};

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const obj = {
    nama:  document.getElementById('nama').value.trim(),
    plat:  document.getElementById('plat').value.toUpperCase().trim(),
    jenis: document.getElementById('jenis').value,
    masuk: document.getElementById('masuk').value,
    keluar: document.getElementById('keluar').value,
    biaya: document.getElementById('biaya').value,
  };

  if (editIdx >= 0) {
    dataTx[editIdx] = obj;
    editIdx = -1;
  } else {
    dataTx.push(obj);
  }

  saveTx();
  renderTx();
  form.reset();
  btnBatal.style.display = 'none';
});

btnBatal.addEventListener('click', function() {
  form.reset();
  editIdx = -1;
  btnBatal.style.display = 'none';
});

renderTx();
