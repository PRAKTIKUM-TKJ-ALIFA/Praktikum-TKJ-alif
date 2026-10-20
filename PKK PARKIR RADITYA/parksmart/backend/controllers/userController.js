const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    let query = 'UPDATE users SET name = ?, email = ?, role = ?';
    const params = [name, email, role];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashed);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const id = req.user.id;

    let query = 'UPDATE users SET name = ?';
    const params = [name];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashed);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, updateProfile };
