import express from 'express';
import { protect } from '../middleware/auth.js';
// Note: validation is optional here; using simple handlers for now
import {
  getRecentActivitiesController,
  getActivitiesByTypeController,
  getActivityStatsController
} from '../controllers/activityController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/activities - Get recent activities
router.get('/', getRecentActivitiesController);

// GET /api/activities/stats - Get activity statistics
router.get('/stats', getActivityStatsController);

// GET /api/activities/type/:type - Get activities by type
router.get('/type/:type', getActivitiesByTypeController);

export default router;
