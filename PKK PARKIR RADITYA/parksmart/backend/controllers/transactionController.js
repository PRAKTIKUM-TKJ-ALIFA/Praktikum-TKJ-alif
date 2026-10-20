const db = require('../config/db');
const moment = require('moment-timezone');

// Harga parkir tetap Rp 5.000 per jam — tidak dapat diubah
const FIXED_RATE_PER_HOUR = 5000;

// Fee calculation: Rp 5.000 × jumlah jam (dibulatkan ke atas, minimum 1 jam)
const calculateFee = (durationMinutes) => {
  const hours = Math.ceil(durationMinutes / 60) || 1;
  return hours * FIXED_RATE_PER_HOUR;
};

// CHECK-IN
const checkIn = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { plate_number, vehicle_type } = req.body;
    if (!plate_number) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'plate_number is required' });
    }

    // Find or create vehicle
    let [vehicles] = await conn.query('SELECT * FROM vehicles WHERE plate_number = ?', [plate_number.toUpperCase()]);
    let vehicle;

    if (vehicles.length === 0) {
      if (!vehicle_type) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'vehicle_type is required for new vehicles' });
      }
      const [result] = await conn.query(
        'INSERT INTO vehicles (plate_number, vehicle_type) VALUES (?, ?)',
        [plate_number.toUpperCase(), vehicle_type]
      );
      vehicle = { id: result.insertId, plate_number: plate_number.toUpperCase(), vehicle_type };
    } else {
      vehicle = vehicles[0];
    }

    // Check if vehicle already has active transaction
    const [activeCheck] = await conn.query(
      `SELECT id FROM parking_transactions WHERE vehicle_id = ? AND check_out IS NULL AND payment_status = 'unpaid'`,
      [vehicle.id]
    );
    if (activeCheck.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Vehicle already has an active parking session' });
    }

    // Find nearest available slot
    const [slots] = await conn.query(
      `SELECT * FROM parking_slots WHERE slot_type = ? AND status = 'available' ORDER BY slot_code ASC LIMIT 1`,
      [vehicle.vehicle_type]
    );

    if (slots.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: `No available slots for ${vehicle.vehicle_type}` });
    }

    const slot = slots[0];
    const checkInTime = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

    // Create transaction
    const [txResult] = await conn.query(
      `INSERT INTO parking_transactions (vehicle_id, slot_id, user_id, check_in, payment_status)
       VALUES (?, ?, ?, ?, 'unpaid')`,
      [vehicle.id, slot.id, req.user.id, checkInTime]
    );

    // Mark slot as occupied
    await conn.query(`UPDATE parking_slots SET status = 'occupied' WHERE id = ?`, [slot.id]);

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: {
        transaction_id: txResult.insertId,
        plate_number: vehicle.plate_number,
        vehicle_type: vehicle.vehicle_type,
        slot_code: slot.slot_code,
        floor: slot.floor,
        check_in: checkInTime,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Check-in error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// CHECK-OUT
const checkOut = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { identifier, payment_method } = req.body; // plate_number or transaction_id
    if (!identifier || !payment_method) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'identifier and payment_method are required' });
    }

    // Find active transaction
    let query;
    let params;

    if (!isNaN(identifier)) {
      query = `
        SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor
        FROM parking_transactions pt
        JOIN vehicles v ON pt.vehicle_id = v.id
        JOIN parking_slots ps ON pt.slot_id = ps.id
        WHERE pt.id = ? AND pt.check_out IS NULL AND pt.payment_status = 'unpaid'
      `;
      params = [identifier];
    } else {
      query = `
        SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor
        FROM parking_transactions pt
        JOIN vehicles v ON pt.vehicle_id = v.id
        JOIN parking_slots ps ON pt.slot_id = ps.id
        WHERE v.plate_number = ? AND pt.check_out IS NULL AND pt.payment_status = 'unpaid'
      `;
      params = [identifier.toUpperCase()];
    }

    const [transactions] = await conn.query(query, params);
    if (transactions.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'No active transaction found' });
    }

    const tx = transactions[0];
    const checkOutTime = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const checkInMoment = moment.tz(tx.check_in, 'Asia/Jakarta');
    const checkOutMoment = moment.tz(checkOutTime, 'Asia/Jakarta');
    const durationMinutes = Math.ceil(checkOutMoment.diff(checkInMoment, 'minutes', true));

    // Get tariff — tidak digunakan, harga sudah tetap Rp 5.000/jam
    const fee = calculateFee(durationMinutes);

    // Update transaction
    await conn.query(
      `UPDATE parking_transactions
       SET check_out = ?, duration_minutes = ?, fee = ?, payment_status = 'paid', payment_method = ?
       WHERE id = ?`,
      [checkOutTime, durationMinutes, fee, payment_method, tx.id]
    );

    // Release slot
    await conn.query(`UPDATE parking_slots SET status = 'available' WHERE id = ?`, [tx.slot_id]);

    await conn.commit();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: {
        transaction_id: tx.id,
        plate_number: tx.plate_number,
        vehicle_type: tx.vehicle_type,
        slot_code: tx.slot_code,
        floor: tx.floor,
        check_in: tx.check_in,
        check_out: checkOutTime,
        duration_minutes: durationMinutes,
        fee,
        payment_method,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Check-out error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// LOOKUP active transaction
const lookupTransaction = async (req, res) => {
  try {
    const { identifier } = req.params;
    let query, params;

    if (!isNaN(identifier)) {
      query = `
        SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor
        FROM parking_transactions pt
        JOIN vehicles v ON pt.vehicle_id = v.id
        JOIN parking_slots ps ON pt.slot_id = ps.id
        WHERE pt.id = ? AND pt.check_out IS NULL AND pt.payment_status = 'unpaid'
      `;
      params = [identifier];
    } else {
      query = `
        SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor
        FROM parking_transactions pt
        JOIN vehicles v ON pt.vehicle_id = v.id
        JOIN parking_slots ps ON pt.slot_id = ps.id
        WHERE v.plate_number = ? AND pt.check_out IS NULL AND pt.payment_status = 'unpaid'
      `;
      params = [identifier.toUpperCase()];
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active transaction found' });
    }

    const tx = rows[0];
    const now = moment().tz('Asia/Jakarta');
    const checkIn = moment.tz(tx.check_in, 'Asia/Jakarta');
    const durationMinutes = Math.ceil(now.diff(checkIn, 'minutes', true));

    // Harga tetap Rp 5.000/jam
    const estimatedFee = calculateFee(durationMinutes);

    res.json({
      success: true,
      data: {
        ...tx,
        duration_minutes: durationMinutes,
        estimated_fee: estimatedFee,
      },
    });
  } catch (err) {
    console.error('Lookup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL TRANSACTIONS (with filters)
const getAllTransactions = async (req, res) => {
  try {
    const { start_date, end_date, vehicle_type, payment_status, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor, u.name AS user_name
      FROM parking_transactions pt
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      LEFT JOIN parking_slots ps ON pt.slot_id = ps.id
      LEFT JOIN users u ON pt.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) { query += ' AND DATE(CONVERT_TZ(pt.created_at, \'+00:00\', \'+07:00\')) >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND DATE(CONVERT_TZ(pt.created_at, \'+00:00\', \'+07:00\')) <= ?'; params.push(end_date); }
    if (vehicle_type) { query += ' AND v.vehicle_type = ?'; params.push(vehicle_type); }
    if (payment_status) { query += ' AND pt.payment_status = ?'; params.push(payment_status); }

    // Count total
    const countQuery = query.replace(
      'SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor, u.name AS user_name',
      'SELECT COUNT(*) AS total'
    );
    const [[{ total }]] = await db.query(countQuery, params);

    query += ' ORDER BY pt.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET MY TRANSACTIONS
const getMyTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [rows] = await db.query(
      `SELECT pt.*, v.plate_number, v.vehicle_type, ps.slot_code, ps.floor
       FROM parking_transactions pt
       LEFT JOIN vehicles v ON pt.vehicle_id = v.id
       LEFT JOIN parking_slots ps ON pt.slot_id = ps.id
       WHERE pt.user_id = ?
       ORDER BY pt.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pt.*, v.plate_number, v.vehicle_type, v.brand, v.color,
              ps.slot_code, ps.floor, u.name AS user_name
       FROM parking_transactions pt
       LEFT JOIN vehicles v ON pt.vehicle_id = v.id
       LEFT JOIN parking_slots ps ON pt.slot_id = ps.id
       LEFT JOIN users u ON pt.user_id = u.id
       WHERE pt.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelTransaction = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;

    const [rows] = await conn.query('SELECT * FROM parking_transactions WHERE id = ?', [id]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const tx = rows[0];
    if (tx.payment_status === 'paid') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cannot cancel a paid transaction' });
    }

    await conn.query(`UPDATE parking_transactions SET payment_status = 'cancelled' WHERE id = ?`, [id]);
    if (tx.slot_id) {
      await conn.query(`UPDATE parking_slots SET status = 'available' WHERE id = ?`, [tx.slot_id]);
    }

    await conn.commit();
    res.json({ success: true, message: 'Transaction cancelled' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

module.exports = {
  checkIn, checkOut, lookupTransaction,
  getAllTransactions, getMyTransactions, getTransactionById, cancelTransaction,
};
