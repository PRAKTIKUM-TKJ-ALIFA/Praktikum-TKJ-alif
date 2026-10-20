const db = require('../config/db');

// Harga parkir tetap Rp 5.000 — tidak dapat diubah
const FIXED_RATE = 5000;

const FIXED_TARIFFS = [
  { id: 1, vehicle_type: 'motor', first_hour_rate: FIXED_RATE, next_hour_rate: FIXED_RATE, daily_max: FIXED_RATE },
  { id: 2, vehicle_type: 'mobil', first_hour_rate: FIXED_RATE, next_hour_rate: FIXED_RATE, daily_max: FIXED_RATE },
  { id: 3, vehicle_type: 'truk',  first_hour_rate: FIXED_RATE, next_hour_rate: FIXED_RATE, daily_max: FIXED_RATE },
];

const getAllTariffs = async (req, res) => {
  res.json({ success: true, data: FIXED_TARIFFS });
};

// Tarif dikunci — perubahan tidak diizinkan
const upsertTariff = async (req, res) => {
  return res.status(403).json({ success: false, message: 'Tarif parkir sudah dikunci pada Rp 5.000 dan tidak dapat diubah.' });
};

const deleteTariff = async (req, res) => {
  return res.status(403).json({ success: false, message: 'Tarif parkir sudah dikunci dan tidak dapat dihapus.' });
};

module.exports = { getAllTariffs, upsertTariff, deleteTariff, FIXED_RATE };
