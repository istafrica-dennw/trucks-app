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
// @access  Private (Admin only)
router.get('/', 
  authorize('admin'),
  validateQuery(truckValidators.getAllTrucks), 
  truckController.getAllTrucks.bind(truckController)
);

// @desc    Get truck statistics
// @route   GET /api/trucks/stats
// @access  Private (Admin only)
router.get('/stats', 
  authorize('admin'),
  truckController.getTruckStats.bind(truckController)
);

// @desc    Get trucks by status
// @route   GET /api/trucks/status/:status
// @access  Private (Admin only)
router.get('/status/:status', 
  authorize('admin'),
  truckController.getTrucksByStatus.bind(truckController)
);

// @desc    Get trucks due for service
// @route   GET /api/trucks/due-for-service
// @access  Private (Admin only)
router.get('/due-for-service', 
  authorize('admin'),
  truckController.getTrucksDueForService.bind(truckController)
);

// @desc    Get truck by ID
// @route   GET /api/trucks/:id
// @access  Private (Admin only)
router.get('/:id', 
  authorize('admin'),
  validateParams(truckValidators.truckId), 
  truckController.getTruckById.bind(truckController)
);

// @desc    Create new truck
// @route   POST /api/trucks
// @access  Private (Admin only)
router.post('/', 
  authorize('admin'),
  validateBody(truckValidators.createTruck), 
  truckController.createTruck.bind(truckController)
);

// @desc    Update truck
// @route   PUT /api/trucks/:id
// @access  Private (Admin only)
router.put('/:id', 
  authorize('admin'),
  validateParams(truckValidators.truckId),
  validateBody(truckValidators.updateTruck), 
  truckController.updateTruck.bind(truckController)
);

// @desc    Delete truck
// @route   DELETE /api/trucks/:id
// @access  Private (Admin only)
router.delete('/:id', 
  authorize('admin'),
  validateParams(truckValidators.truckId), 
  truckController.deleteTruck.bind(truckController)
);

// @desc    Get truck drives
// @route   GET /api/trucks/:id/drives
// @access  Private (Admin only)
router.get('/:id/drives', 
  authorize('admin'),
  validateParams(truckValidators.truckId),
  validateQuery(truckValidators.getAllTrucks), // Reuse pagination validation
  truckController.getTruckDrives.bind(truckController)
);

export default router;