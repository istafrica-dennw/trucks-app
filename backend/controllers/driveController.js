import {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  addInstallment,
  getDriveStats,
  getDrivesByTruck,
  getDrivesByDriver,
  getDrivesByDate
} from '../services/driveService.js';
import logger from '../utils/logger.js';

export const getAllDrivesController = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      status: req.query.status || '',
      truckId: req.query.truckId || '',
      driverId: req.query.driverId || '',
      customer: req.query.customer || '',
      departureCity: req.query.departureCity || '',
      destinationCity: req.query.destinationCity || '',
      paidOption: req.query.paidOption || '',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || 'date',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await getAllDrives(filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getAllDrivesController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives',
      error: error.message
    });
  }
};

export const getDriveByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = await getDriveById(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    logger.error('Error in getDriveByIdController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drive',
      error: error.message
    });
  }
};

export const createDriveController = async (req, res) => {
  try {
    const driveData = req.body;
    const userId = req.user.id;
    
    const drive = await createDrive(driveData, userId);

    res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      data: drive
    });
  } catch (error) {
    logger.error('Error in createDriveController', { error: error.message });
    
    if (error.message.includes('not found') || error.message.includes('exceed')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create drive',
      error: error.message
    });
  }
};

export const updateDriveController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const drive = await updateDrive(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Drive updated successfully',
      data: drive
    });
  } catch (error) {
    logger.error('Error in updateDriveController', { error: error.message });
    
    if (error.message === 'Drive not found') {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    if (error.message.includes('exceed')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update drive',
      error: error.message
    });
  }
};

export const deleteDriveController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDrive(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in deleteDriveController', { error: error.message });
    
    if (error.message === 'Drive not found') {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete drive',
      error: error.message
    });
  }
};

export const addInstallmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const installmentData = req.body;
    
    const drive = await addInstallment(id, installmentData);

    res.status(200).json({
      success: true,
      message: 'Installment added successfully',
      data: drive
    });
  } catch (error) {
    logger.error('Error in addInstallmentController', { error: error.message });
    
    if (error.message === 'Drive not found') {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    if (error.message.includes('installment') || error.message.includes('exceed')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add installment',
      error: error.message
    });
  }
};

export const getDriveStatsController = async (req, res) => {
  try {
    const stats = await getDriveStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getDriveStatsController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drive statistics',
      error: error.message
    });
  }
};

export const getDrivesByTruckController = async (req, res) => {
  try {
    const { truckId } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status || ''
    };

    const result = await getDrivesByTruck(truckId, filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getDrivesByTruckController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives by truck',
      error: error.message
    });
  }
};

export const getDrivesByDriverController = async (req, res) => {
  try {
    const { driverId } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status || ''
    };

    const result = await getDrivesByDriver(driverId, filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getDrivesByDriverController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives by driver',
      error: error.message
    });
  }
};

export const getDrivesByDateController = async (req, res) => {
  try {
    const { date } = req.params;
    const drives = await getDrivesByDate(date);

    res.status(200).json({
      success: true,
      data: drives
    });
  } catch (error) {
    logger.error('Error in getDrivesByDateController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives by date',
      error: error.message
    });
  }
};