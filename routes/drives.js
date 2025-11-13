import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validation.js';
import { uploadPaymentProof } from '../middleware/upload.js';
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
  getDrivesByDateController,
  getPaymentProofController,
  getFullPaymentProofController,
  getExpenseProofController
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

// POST /api/drives - Create new drive (admin/officer only)
// Note: For full payment with attachment, we use FormData, so validation is done in controller
router.post('/', 
  authorize('admin', 'officer'),
  uploadPaymentProof,
  createDriveController
);

// IMPORTANT: More specific routes must come before generic /:id route
// GET /api/drives/:id/payment-proof - Get full payment proof attachment
router.get('/:id/payment-proof',
  protect,
  getFullPaymentProofController
);

// GET /api/drives/:id/expense/:expenseIndex/proof - Get expense proof attachment
router.get('/:id/expense/:expenseIndex/proof',
  protect,
  getExpenseProofController
);

// GET /api/drives/:id/installment/:installmentIndex/proof - Get installment payment proof attachment
// Note: We don't use validateParams here because it strips installmentIndex due to stripUnknown: true
router.get('/:id/installment/:installmentIndex/proof',
  protect,
  getPaymentProofController
);

// GET /api/drives/:id - Get drive by ID (must come after specific routes)
router.get('/:id', 
  validateParams(driveId),
  getDriveByIdController
);

// PUT /api/drives/:id - Update drive (admin/officer only)
// Note: For full payment with attachment, we use FormData, so validation is done in controller
router.put('/:id', 
  authorize('admin', 'officer'),
  validateParams(driveId),
  uploadPaymentProof,
  updateDriveController
);

// DELETE /api/drives/:id - Delete drive (admin/officer only)
router.delete('/:id', 
  authorize('admin', 'officer'),
  validateParams(driveId),
  deleteDriveController
);

// POST /api/drives/:id/installment - Add installment payment (admin/officer only)
router.post('/:id/installment', 
  authorize('admin', 'officer'),
  validateParams(driveId),
  uploadPaymentProof,
  addInstallmentController
);

export default router;