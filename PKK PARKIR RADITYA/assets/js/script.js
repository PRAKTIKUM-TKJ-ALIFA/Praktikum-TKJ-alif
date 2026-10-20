// ── Pelanggan — localStorage CRUD ──
const KEY_PELANGGAN = 'pelanggan_data';
let dataPelanggan = JSON.parse(localStorage.getItem(KEY_PELANGGAN)) || [];
let editIndex = -1;

const form     = document.getElementById('formPelanggan');
const tbody    = document.querySelector('#tabelPelanggan tbody');
const btnBatal = document.getElementById('btnBatal');
const counter  = document.getElementById('jumlahPelanggan');

if (!form) { /* guard: only run on pelanggan page */ }
else {

  function savePelanggan() {
    localStorage.setItem(KEY_PELANGGAN, JSON.stringify(dataPelanggan));
  }

  function renderPelanggan() {
    tbody.innerHTML = '';
    if (counter) counter.textContent = dataPelanggan.length + ' data';

    dataPelanggan.forEach((item, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><strong>${item.nama}</strong></td>
        <td>${item.hp}</td>
        <td>${item.alamat}</td>
        <td>
          <button onclick="editPelanggan(${i})" class="btn btn-warning btn-sm">
            <i class="fas fa-pen"></i>
          </button>
          <button onclick="hapusPelanggan(${i})" class="btn btn-danger btn-sm" style="margin-left:6px;">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  window.editPelanggan = function(i) {
    const d = dataPelanggan[i];
    document.getElementById('nama').value   = d.nama;
    document.getElementById('hp').value     = d.hp;
    document.getElementById('alamat').value = d.alamat;
    editIndex = i;
    btnBatal.style.display = 'inline-flex';
    document.getElementById('nama').focus();
  };

  window.hapusPelanggan = function(i) {
    if (confirm('Hapus data pelanggan ini?')) {
      dataPelanggan.splice(i, 1);
      savePelanggan();
      renderPelanggan();
    }
  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const obj = {
      nama:   document.getElementById('nama').value.trim(),
      hp:     document.getElementById('hp').value.trim(),
      alamat: document.getElementById('alamat').value.trim(),
    };
    if (editIndex >= 0) {
      dataPelanggan[editIndex] = obj;
      editIndex = -1;
    } else {
      dataPelanggan.push(obj);
    }
    savePelanggan();
    renderPelanggan();
    form.reset();
    btnBatal.style.display = 'none';
  });

  btnBatal.addEventListener('click', function() {
    form.reset();
    editIndex = -1;
    btnBatal.style.display = 'none';
  });

  document.addEventListener('DOMContentLoaded', renderPelanggan);
  renderPelanggan();
}
