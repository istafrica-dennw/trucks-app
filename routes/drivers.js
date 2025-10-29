import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validation.js';
import {
  driverId,
  getAllDrivers,
  createDriver,
  updateDriver
} from '../validators/driverValidators.js';
import {
  getAllDriversController,
  getDriverByIdController,
  createDriverController,
  updateDriverController,
  deleteDriverController,
  getDriverDrivesController,
  getDriverStatsController,
  getDriversByStatusController
} from '../controllers/driverController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/drivers - List all drivers with pagination and filtering
router.get('/', 
  validateQuery(getAllDrivers),
  getAllDriversController
);

// GET /api/drivers/stats - Get driver statistics for dashboard
router.get('/stats', getDriverStatsController);

// GET /api/drivers/status/:status - Get drivers by status
router.get('/status/:status', 
  validateParams(driverId),
  getDriversByStatusController
);

// POST /api/drivers - Create new driver (admin only)
router.post('/', 
  authorize('admin'),
  validate(createDriver),
  createDriverController
);

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', 
  validateParams(driverId),
  getDriverByIdController
);

// PUT /api/drivers/:id - Update driver (admin only)
router.put('/:id', 
  authorize('admin'),
  validateParams(driverId),
  validate(updateDriver),
  updateDriverController
);

// DELETE /api/drivers/:id - Delete driver (admin only)
router.delete('/:id', 
  authorize('admin'),
  validateParams(driverId),
  deleteDriverController
);

// GET /api/drivers/:id/drives - Get drives for specific driver
router.get('/:id/drives', 
  validateParams(driverId),
  getDriverDrivesController
);

export default router;