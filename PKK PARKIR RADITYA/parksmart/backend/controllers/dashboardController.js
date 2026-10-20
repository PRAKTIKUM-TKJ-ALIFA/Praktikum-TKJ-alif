const db = require('../config/db');
const moment = require('moment-timezone');

const getSummary = async (req, res) => {
  try {
    const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');

    const [[slotStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_slots,
        SUM(status = 'available') AS available,
        SUM(status = 'occupied') AS occupied,
        SUM(status = 'reserved') AS reserved,
        SUM(status = 'maintenance') AS maintenance
      FROM parking_slots
    `);

    const [[revenueToday]] = await db.query(`
      SELECT COALESCE(SUM(fee), 0) AS revenue_today
      FROM parking_transactions
      WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = ?
        AND payment_status = 'paid'
    `, [today]);

    const [[activeTransactions]] = await db.query(`
      SELECT COUNT(*) AS active
      FROM parking_transactions
      WHERE check_out IS NULL AND payment_status = 'unpaid'
    `);

    res.json({
      success: true,
      data: {
        total_slots: slotStats.total_slots || 0,
        available: slotStats.available || 0,
        occupied: slotStats.occupied || 0,
        reserved: slotStats.reserved || 0,
        maintenance: slotStats.maintenance || 0,
        revenue_today: revenueToday.revenue_today || 0,
        active_transactions: activeTransactions.active || 0,
      },
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    let query;

    if (period === 'weekly') {
      query = `
        SELECT
          DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) AS date,
          COALESCE(SUM(fee), 0) AS revenue,
          COUNT(*) AS transactions
        FROM parking_transactions
        WHERE payment_status = 'paid'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(CONVERT_TZ(created_at, '+00:00', '+07:00'))
        ORDER BY date ASC
      `;
    } else if (period === 'monthly') {
      query = `
        SELECT
          DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%Y-%m') AS date,
          COALESCE(SUM(fee), 0) AS revenue,
          COUNT(*) AS transactions
        FROM parking_transactions
        WHERE payment_status = 'paid'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%Y-%m')
        ORDER BY date ASC
      `;
    } else {
      query = `
        SELECT
          DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) AS date,
          COALESCE(SUM(fee), 0) AS revenue,
          COUNT(*) AS transactions
        FROM parking_transactions
        WHERE payment_status = 'paid'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(CONVERT_TZ(created_at, '+00:00', '+07:00'))
        ORDER BY date ASC
      `;
    }

    const [rows] = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Revenue chart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        pt.id,
        v.plate_number,
        v.vehicle_type,
        ps.slot_code,
        ps.floor,
        pt.check_in,
        pt.check_out,
        pt.duration_minutes,
        pt.fee,
        pt.payment_status,
        pt.payment_method,
        u.name AS user_name
      FROM parking_transactions pt
      LEFT JOIN vehicles v ON pt.vehicle_id = v.id
      LEFT JOIN parking_slots ps ON pt.slot_id = ps.id
      LEFT JOIN users u ON pt.user_id = u.id
      ORDER BY pt.created_at DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Recent transactions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getSummary, getRevenueChart, getRecentTransactions };
