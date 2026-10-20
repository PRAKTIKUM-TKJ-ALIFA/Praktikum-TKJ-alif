const express = require('express');
const router = express.Router();
const {
  checkIn, checkOut, lookupTransaction,
  getAllTransactions, getMyTransactions, getTransactionById, cancelTransaction
} = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/checkin', authorize('admin', 'operator'), checkIn);
router.post('/checkout', authorize('admin', 'operator'), checkOut);
router.get('/lookup/:identifier', authorize('admin', 'operator'), lookupTransaction);
router.get('/my', getMyTransactions);
router.get('/', authorize('admin', 'operator'), getAllTransactions);
router.get('/:id', getTransactionById);
router.patch('/:id/cancel', authorize('admin'), cancelTransaction);

module.exports = router;
