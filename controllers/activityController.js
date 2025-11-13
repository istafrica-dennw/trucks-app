import {
  getRecentActivities,
  getActivitiesByType,
  getActivityStats
} from '../services/activityService.js';
import logger from '../utils/logger.js';

export const getRecentActivitiesController = async (req, res) => {
  try {
    const { limit = 10, type, userId, journeyId, truckId, driverId } = req.query;
    
    // Build filters
    const filters = {};
    if (type) filters.type = type;
    if (userId) filters.userId = userId;
    if (journeyId) filters.journeyId = journeyId;
    if (truckId) filters.truckId = truckId;
    if (driverId) filters.driverId = driverId;

    const activities = await getRecentActivities(parseInt(limit), filters);
    
    res.status(200).json({
      success: true,
      data: activities,
      count: activities.length
    });
  } catch (error) {
    logger.error('Error in getRecentActivitiesController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activities',
      error: error.message
    });
  }
};

export const getActivitiesByTypeController = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20 } = req.query;

    const activities = await getActivitiesByType(type, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: activities,
      count: activities.length,
      type
    });
  } catch (error) {
    logger.error('Error in getActivitiesByTypeController', { error: error.message, type: req.params.type });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activities by type',
      error: error.message
    });
  }
};

export const getActivityStatsController = async (req, res) => {
  try {
    const stats = await getActivityStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getActivityStatsController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity statistics',
      error: error.message
    });
  }
};

