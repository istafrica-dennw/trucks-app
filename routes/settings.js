import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getSettingsController, updateExchangeRatesController } from '../controllers/settingsController.js';

const router = express.Router();

// GET /api/settings - Get settings (authenticated users)
router.get('/', protect, getSettingsController);

// PUT /api/settings/exchange-rates - Update exchange rates (admin/officer only)
router.put('/exchange-rates', protect, authorize('admin', 'officer'), updateExchangeRatesController);

export default router;


