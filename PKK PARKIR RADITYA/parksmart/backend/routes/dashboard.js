const express = require('express');
const router = express.Router();
const { getSummary, getRevenueChart, getRecentTransactions } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'operator'));

router.get('/summary', getSummary);
router.get('/revenue-chart', getRevenueChart);
router.get('/recent-transactions', getRecentTransactions);

module.exports = router;
