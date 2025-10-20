import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validation.js';
import {
  driveId,
  getAllDrives,
  createDrive,
  updateDrive,
  addInstallment
} from '../validators/driveValidators.js';
import {
  getAllDrivesController,
  getDriveByIdController,
  createDriveController,
  updateDriveController,
  deleteDriveController,
  addInstallmentController,
  getDriveStatsController,
  getDrivesByTruckController,
  getDrivesByDriverController,
  getDrivesByDateController
} from '../controllers/driveController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/drives - List all drives with pagination and filtering
router.get('/', 
  validateQuery(getAllDrives),
  getAllDrivesController
);

// GET /api/drives/stats - Get drive statistics for dashboard
router.get('/stats', getDriveStatsController);

// GET /api/drives/by-day/:date - Get drives for specific day
router.get('/by-day/:date', 
  validateParams(driveId),
  getDrivesByDateController
);

// GET /api/drives/by-truck/:truckId - Get drives for specific truck
router.get('/by-truck/:truckId', 
  validateParams(driveId),
  getDrivesByTruckController
);

// GET /api/drives/by-driver/:driverId - Get drives for specific driver
router.get('/by-driver/:driverId', 
  validateParams(driveId),
  getDrivesByDriverController
);

// POST /api/drives - Create new drive (admin only)
router.post('/', 
  authorize('admin'),
  validate(createDrive),
  createDriveController
);

// GET /api/drives/:id - Get drive by ID
router.get('/:id', 
  validateParams(driveId),
  getDriveByIdController
);

// PUT /api/drives/:id - Update drive (admin only)
router.put('/:id', 
  authorize('admin'),
  validateParams(driveId),
  validate(updateDrive),
  updateDriveController
);

// DELETE /api/drives/:id - Delete drive (admin only)
router.delete('/:id', 
  authorize('admin'),
  validateParams(driveId),
  deleteDriveController
);

// POST /api/drives/:id/installment - Add installment payment (admin only)
router.post('/:id/installment', 
  authorize('admin'),
  validateParams(driveId),
  validate(addInstallment),
  addInstallmentController
);

export default router;