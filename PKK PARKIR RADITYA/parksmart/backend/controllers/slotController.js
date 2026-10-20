const db = require('../config/db');

const getAllSlots = async (req, res) => {
  try {
    const { floor, status, slot_type } = req.query;
    let query = 'SELECT * FROM parking_slots WHERE 1=1';
    const params = [];

    if (floor) { query += ' AND floor = ?'; params.push(floor); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (slot_type) { query += ' AND slot_type = ?'; params.push(slot_type); }

    query += ' ORDER BY floor, slot_code';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSlotById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM parking_slots WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createSlot = async (req, res) => {
  try {
    const { slot_code, slot_type, floor, status } = req.body;
    if (!slot_code || !slot_type || !floor) {
      return res.status(400).json({ success: false, message: 'slot_code, slot_type, and floor are required' });
    }

    const [existing] = await db.query('SELECT id FROM parking_slots WHERE slot_code = ?', [slot_code]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Slot code already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO parking_slots (slot_code, slot_type, floor, status) VALUES (?, ?, ?, ?)',
      [slot_code, slot_type, floor, status || 'available']
    );

    res.status(201).json({ success: true, message: 'Slot created', data: { id: result.insertId } });
  } catch (err) {
    console.error('Create slot error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateSlot = async (req, res) => {
  try {
    const { slot_code, slot_type, floor, status } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM parking_slots WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Slot not found' });

    await db.query(
      'UPDATE parking_slots SET slot_code = ?, slot_type = ?, floor = ?, status = ? WHERE id = ?',
      [slot_code, slot_type, floor, status, id]
    );

    res.json({ success: true, message: 'Slot updated' });
  } catch (err) {
    console.error('Update slot error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateSlotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['available', 'occupied', 'reserved', 'maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [existing] = await db.query('SELECT id FROM parking_slots WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Slot not found' });

    await db.query('UPDATE parking_slots SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Slot status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id, status FROM parking_slots WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (existing[0].status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied slot' });
    }

    await db.query('DELETE FROM parking_slots WHERE id = ?', [id]);
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    console.error('Delete slot error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSlotMap = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ps.*, 
        pt.id AS transaction_id,
        v.plate_number,
        pt.check_in
      FROM parking_slots ps
      LEFT JOIN parking_transactions pt ON ps.id = pt.slot_id AND pt.check_out IS NULL AND pt.payment_status = 'unpaid'
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      ORDER BY ps.floor, ps.slot_code
    `);

    // Group by floor
    const map = {};
    rows.forEach(row => {
      if (!map[row.floor]) map[row.floor] = [];
      map[row.floor].push(row);
    });

    res.json({ success: true, data: map });
  } catch (err) {
    console.error('Slot map error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllSlots, getSlotById, createSlot, updateSlot, updateSlotStatus, deleteSlot, getSlotMap };
