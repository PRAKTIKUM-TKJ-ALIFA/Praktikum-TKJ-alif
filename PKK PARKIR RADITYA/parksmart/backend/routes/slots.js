const express = require('express');
const router = express.Router();
const {
  getAllSlots, getSlotById, createSlot, updateSlot,
  updateSlotStatus, deleteSlot, getSlotMap
} = require('../controllers/slotController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAllSlots);
router.get('/map', getSlotMap);
router.get('/:id', getSlotById);

router.post('/', authorize('admin'), createSlot);
router.put('/:id', authorize('admin'), updateSlot);
router.patch('/:id/status', authorize('admin', 'operator'), updateSlotStatus);
router.delete('/:id', authorize('admin'), deleteSlot);

module.exports = router;
