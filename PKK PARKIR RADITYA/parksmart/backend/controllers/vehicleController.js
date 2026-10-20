const db = require('../config/db');

const getAllVehicles = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, u.name AS owner_name, u.email AS owner_email
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyVehicles = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vehicles WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getVehicleByPlate = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, u.name AS owner_name FROM vehicles v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.plate_number = ?`,
      [req.params.plate]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { plate_number, vehicle_type, brand, color, user_id } = req.body;

    if (!plate_number || !vehicle_type) {
      return res.status(400).json({ success: false, message: 'plate_number and vehicle_type are required' });
    }

    const [existing] = await db.query('SELECT id FROM vehicles WHERE plate_number = ?', [plate_number]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Plate number already registered' });
    }

    const ownerId = req.user.role === 'admin' && user_id ? user_id : req.user.id;

    const [result] = await db.query(
      'INSERT INTO vehicles (user_id, plate_number, vehicle_type, brand, color) VALUES (?, ?, ?, ?, ?)',
      [ownerId, plate_number.toUpperCase(), vehicle_type, brand || null, color || null]
    );

    res.status(201).json({ success: true, message: 'Vehicle registered', data: { id: result.insertId } });
  } catch (err) {
    console.error('Create vehicle error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { plate_number, vehicle_type, brand, color } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Only owner or admin can update
    if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query(
      'UPDATE vehicles SET plate_number = ?, vehicle_type = ?, brand = ?, color = ? WHERE id = ?',
      [plate_number.toUpperCase(), vehicle_type, brand, color, id]
    );

    res.json({ success: true, message: 'Vehicle updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllVehicles, getMyVehicles, getVehicleByPlate, createVehicle, updateVehicle, deleteVehicle };
