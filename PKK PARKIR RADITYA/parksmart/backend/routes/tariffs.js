const express = require('express');
const router = express.Router();
const { getAllTariffs, upsertTariff, deleteTariff } = require('../controllers/tariffController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllTariffs);
router.post('/', authenticate, authorize('admin'), upsertTariff);
router.delete('/:id', authenticate, authorize('admin'), deleteTariff);

module.exports = router;
