import truckService from '../services/truckService.js';
import { createTruckActivity } from '../services/activityService.js';
import logger from '../utils/logger.js';

class TruckController {
  // Get all trucks
  async getAllTrucks(req, res) {
    try {
      const result = await truckService.getAllTrucks(req.query);
      
      res.status(200).json({
        success: true,
        data: result.trucks,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in getAllTrucks controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trucks'
      });
    }
  }

  // Get truck by ID
  async getTruckById(req, res) {
    try {
      const { id } = req.params;
      const truck = await truckService.getTruckById(id);
      
      res.status(200).json({
        success: true,
        data: truck
      });
    } catch (error) {
      logger.error(`Error in getTruckById controller for ID ${req.params.id}:`, error);
      
      if (error.message === 'Truck not found') {
        return res.status(404).json({
          success: false,
          message: 'Truck not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve truck'
      });
    }
  }

  // Create new truck
  async createTruck(req, res) {
    try {
      const truck = await truckService.createTruck(req.body);
      
      // Create activity for truck added
      try {
        await createTruckActivity(truck, req.user, 'added');
      } catch (activityError) {
        logger.warn('Failed to create truck activity', { error: activityError.message, truckId: truck._id });
      }
      
      res.status(201).json({
        success: true,
        data: truck,
        message: 'Truck created successfully'
      });
    } catch (error) {
      logger.error('Error in createTruck controller:', error);
      
      if (error.message.includes('already exists') || error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create truck'
      });
    }
  }

  // Update truck
  async updateTruck(req, res) {
    try {
      const { id } = req.params;
      const truck = await truckService.updateTruck(id, req.body);
      
      // Create activity for truck updated
      try {
        await createTruckActivity(truck, req.user, 'updated');
      } catch (activityError) {
        logger.warn('Failed to create truck update activity', { error: activityError.message, truckId: truck._id });
      }
      
      res.status(200).json({
        success: true,
        data: truck,
        message: 'Truck updated successfully'
      });
    } catch (error) {
      logger.error(`Error in updateTruck controller for ID ${req.params.id}:`, error);
      
      if (error.message === 'Truck not found') {
        return res.status(404).json({
          success: false,
          message: 'Truck not found'
        });
      }
      
      if (error.message.includes('already exists') || error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update truck'
      });
    }
  }

  // Delete truck
  async deleteTruck(req, res) {
    try {
      const { id } = req.params;
      const result = await truckService.deleteTruck(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error(`Error in deleteTruck controller for ID ${req.params.id}:`, error);
      
      if (error.message === 'Truck not found') {
        return res.status(404).json({
          success: false,
          message: 'Truck not found'
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
        message: 'Failed to delete truck'
      });
    }
  }

  // Get truck drives
  async getTruckDrives(req, res) {
    try {
      const { id } = req.params;
      const result = await truckService.getTruckDrives(id, req.query);
      
      res.status(200).json({
        success: true,
        data: result.drives,
        truck: result.truck,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error(`Error in getTruckDrives controller for ID ${req.params.id}:`, error);
      
      if (error.message === 'Truck not found') {
        return res.status(404).json({
          success: false,
          message: 'Truck not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve truck drives'
      });
    }
  }

  // Get truck statistics
  async getTruckStats(req, res) {
    try {
      const stats = await truckService.getTruckStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getTruckStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve truck statistics'
      });
    }
  }

  // Get trucks by status
  async getTrucksByStatus(req, res) {
    try {
      const { status } = req.params;
      const trucks = await truckService.getTrucksByStatus(status);
      
      res.status(200).json({
        success: true,
        data: trucks
      });
    } catch (error) {
      logger.error(`Error in getTrucksByStatus controller for status ${req.params.status}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trucks by status'
      });
    }
  }

  // Get trucks due for service
  async getTrucksDueForService(req, res) {
    try {
      const trucks = await truckService.getTrucksDueForService();
      
      res.status(200).json({
        success: true,
        data: trucks
      });
    } catch (error) {
      logger.error('Error in getTrucksDueForService controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trucks due for service'
      });
    }
  }
}

export default new TruckController();