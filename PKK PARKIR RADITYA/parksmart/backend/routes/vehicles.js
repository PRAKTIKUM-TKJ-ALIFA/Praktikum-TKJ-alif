const express = require('express');
const router = express.Router();
const {
  getAllVehicles, getMyVehicles, getVehicleByPlate,
  createVehicle, updateVehicle, deleteVehicle
} = require('../controllers/vehicleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'operator'), getAllVehicles);
router.get('/my', getMyVehicles);
router.get('/plate/:plate', getVehicleByPlate);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
