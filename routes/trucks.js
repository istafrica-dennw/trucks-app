import express from 'express';
import truckController from '../controllers/truckController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import truckValidators from '../validators/truckValidators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all trucks with pagination and filtering
// @route   GET /api/trucks
// @access  Private (All authenticated users)
router.get('/', 
  validateQuery(truckValidators.getAllTrucks), 
  truckController.getAllTrucks.bind(truckController)
);

// @desc    Get truck statistics
// @route   GET /api/trucks/stats
// @access  Private (All authenticated users)
router.get('/stats', 
  truckController.getTruckStats.bind(truckController)
);

// @desc    Get trucks by status
// @route   GET /api/trucks/status/:status
// @access  Private (All authenticated users)
router.get('/status/:status', 
  truckController.getTrucksByStatus.bind(truckController)
);

// @desc    Get trucks due for service
// @route   GET /api/trucks/due-for-service
// @access  Private (All authenticated users)
router.get('/due-for-service', 
  truckController.getTrucksDueForService.bind(truckController)
);

// @desc    Get truck by ID
// @route   GET /api/trucks/:id
// @access  Private (All authenticated users)
router.get('/:id', 
  validateParams(truckValidators.truckId), 
  truckController.getTruckById.bind(truckController)
);

// @desc    Create new truck
// @route   POST /api/trucks
// @access  Private (Admin/Officer only)
router.post('/', 
  authorize('admin', 'officer'),
  validateBody(truckValidators.createTruck), 
  truckController.createTruck.bind(truckController)
);

// @desc    Update truck
// @route   PUT /api/trucks/:id
// @access  Private (Admin/Officer only)
router.put('/:id', 
  authorize('admin', 'officer'),
  validateParams(truckValidators.truckId),
  validateBody(truckValidators.updateTruck), 
  truckController.updateTruck.bind(truckController)
);

// @desc    Delete truck
// @route   DELETE /api/trucks/:id
// @access  Private (Admin/Officer only)
router.delete('/:id', 
  authorize('admin', 'officer'),
  validateParams(truckValidators.truckId), 
  truckController.deleteTruck.bind(truckController)
);

// @desc    Get truck drives
// @route   GET /api/trucks/:id/drives
// @access  Private (All authenticated users)
router.get('/:id/drives', 
  validateParams(truckValidators.truckId),
  validateQuery(truckValidators.getAllTrucks), // Reuse pagination validation
  truckController.getTruckDrives.bind(truckController)
);

export default router;