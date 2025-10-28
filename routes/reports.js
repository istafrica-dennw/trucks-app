import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateParams, validateQuery } from '../middleware/validation.js';
import * as reportController from '../controllers/reportController.js';
import { daily, weekly, monthly, custom } from '../validators/reportValidators.js';

const router = express.Router();

router.use(protect);

router.get('/daily/:date', validateParams(daily), reportController.dailyReport);
router.get('/weekly/:week', validateParams(weekly), reportController.weeklyReport);
router.get('/monthly/:month', validateParams(monthly), reportController.monthlyReport);
router.get('/custom', validateQuery(custom), reportController.customReport);
router.get('/summary', reportController.summaryReport);

export default router;

