import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverDrives,
  getDriverStats,
  getDriversByStatus
} from '../services/driverService.js';
import logger from '../utils/logger.js';

export const getAllDriversController = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      status: req.query.status || '',
      sortBy: req.query.sortBy || 'fullName',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const result = await getAllDrivers(filters);

    res.status(200).json({
      success: true,
      data: result.drivers,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getAllDriversController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drivers',
      error: error.message
    });
  }
};

export const getDriverByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await getDriverById(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    logger.error('Error in getDriverByIdController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve driver',
      error: error.message
    });
  }
};

export const createDriverController = async (req, res) => {
  try {
    const driverData = req.body;
    const driver = await createDriver(driverData);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    logger.error('Error in createDriverController', { error: error.message });
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create driver',
      error: error.message
    });
  }
};

export const updateDriverController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const driver = await updateDriver(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    logger.error('Error in updateDriverController', { error: error.message });
    
    if (error.message === 'Driver not found') {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update driver',
      error: error.message
    });
  }
};

export const deleteDriverController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDriver(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in deleteDriverController', { error: error.message });
    
    if (error.message === 'Driver not found') {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (error.message.includes('associated drive')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete driver',
      error: error.message
    });
  }
};

export const getDriverDrivesController = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status || ''
    };

    const result = await getDriverDrives(id, filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getDriverDrivesController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve driver drives',
      error: error.message
    });
  }
};

export const getDriverStatsController = async (req, res) => {
  try {
    const stats = await getDriverStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getDriverStatsController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve driver statistics',
      error: error.message
    });
  }
};

export const getDriversByStatusController = async (req, res) => {
  try {
    const { status } = req.params;
    const drivers = await getDriversByStatus(status);

    res.status(200).json({
      success: true,
      data: drivers
    });
  } catch (error) {
    logger.error('Error in getDriversByStatusController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drivers by status',
      error: error.message
    });
  }
};