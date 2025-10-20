import Truck from '../models/Truck.js';
import Drive from '../models/Drive.js';
import logger from '../utils/logger.js';

class TruckService {
  // Get all trucks with pagination and filtering
  async getAllTrucks(query = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        make,
        search
      } = query;

      // Build filter object
      const filter = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (make) {
        filter.make = new RegExp(make, 'i');
      }
      
      if (search) {
        filter.$or = [
          { plateNumber: new RegExp(search, 'i') },
          { make: new RegExp(search, 'i') },
          { model: new RegExp(search, 'i') },
          { vin: new RegExp(search, 'i') }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [trucks, total] = await Promise.all([
        Truck.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Truck.countDocuments(filter)
      ]);

      // Calculate pagination info
      const pages = Math.ceil(total / limit);

      logger.info(`Retrieved ${trucks.length} trucks (page ${page}/${pages})`, {
        filter,
        pagination: { page, limit, total, pages }
      });

      return {
        trucks,
        pagination: {
          current: page,
          pages,
          total,
          limit
        }
      };
    } catch (error) {
      logger.error('Error getting all trucks:', error);
      throw new Error('Failed to retrieve trucks');
    }
  }

  // Get truck by ID
  async getTruckById(truckId) {
    try {
      const truck = await Truck.findById(truckId).lean();
      
      if (!truck) {
        throw new Error('Truck not found');
      }

      logger.info(`Retrieved truck: ${truck.plateNumber}`, { truckId });
      return truck;
    } catch (error) {
      logger.error(`Error getting truck by ID ${truckId}:`, error);
      if (error.message === 'Truck not found') {
        throw error;
      }
      throw new Error('Failed to retrieve truck');
    }
  }

  // Create new truck
  async createTruck(truckData) {
    try {
      // Check if plate number already exists
      const existingTruck = await Truck.findOne({ 
        plateNumber: truckData.plateNumber.toUpperCase() 
      });
      
      if (existingTruck) {
        throw new Error('Truck with this plate number already exists');
      }

      // Check if VIN already exists (if provided)
      if (truckData.vin) {
        const existingVin = await Truck.findOne({ vin: truckData.vin });
        if (existingVin) {
          throw new Error('Truck with this VIN already exists');
        }
      }

      const truck = new Truck(truckData);
      await truck.save();

      logger.info(`Created new truck: ${truck.plateNumber}`, {
        truckId: truck._id,
        plateNumber: truck.plateNumber
      });

      return truck;
    } catch (error) {
      logger.error('Error creating truck:', error);
      if (error.message.includes('already exists') || error.name === 'ValidationError') {
        throw error;
      }
      throw new Error('Failed to create truck');
    }
  }

  // Update truck
  async updateTruck(truckId, updateData) {
    try {
      // Check if truck exists
      const existingTruck = await Truck.findById(truckId);
      if (!existingTruck) {
        throw new Error('Truck not found');
      }

      // Check for plate number conflicts (if being updated)
      if (updateData.plateNumber && updateData.plateNumber !== existingTruck.plateNumber) {
        const plateExists = await Truck.findOne({ 
          plateNumber: updateData.plateNumber.toUpperCase(),
          _id: { $ne: truckId }
        });
        if (plateExists) {
          throw new Error('Truck with this plate number already exists');
        }
      }

      // Check for VIN conflicts (if being updated)
      if (updateData.vin && updateData.vin !== existingTruck.vin) {
        const vinExists = await Truck.findOne({ 
          vin: updateData.vin,
          _id: { $ne: truckId }
        });
        if (vinExists) {
          throw new Error('Truck with this VIN already exists');
        }
      }

      const updatedTruck = await Truck.findByIdAndUpdate(
        truckId,
        updateData,
        { new: true, runValidators: true }
      );

      logger.info(`Updated truck: ${updatedTruck.plateNumber}`, {
        truckId,
        updates: Object.keys(updateData)
      });

      return updatedTruck;
    } catch (error) {
      logger.error(`Error updating truck ${truckId}:`, error);
      if (error.message.includes('not found') || 
          error.message.includes('already exists') || 
          error.name === 'ValidationError') {
        throw error;
      }
      throw new Error('Failed to update truck');
    }
  }

  // Delete truck
  async deleteTruck(truckId) {
    try {
      // Check if truck exists
      const truck = await Truck.findById(truckId);
      if (!truck) {
        throw new Error('Truck not found');
      }

      // Check if truck has associated drives
      const driveCount = await Drive.countDocuments({ truck: truckId });
      if (driveCount > 0) {
        throw new Error(`Cannot delete truck. It has ${driveCount} associated drive(s). Please remove the drives first.`);
      }

      await Truck.findByIdAndDelete(truckId);

      logger.info(`Deleted truck: ${truck.plateNumber}`, { truckId });

      return { message: 'Truck deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting truck ${truckId}:`, error);
      if (error.message.includes('not found') || error.message.includes('associated drive')) {
        throw error;
      }
      throw new Error('Failed to delete truck');
    }
  }

  // Get truck drives
  async getTruckDrives(truckId, query = {}) {
    try {
      // Check if truck exists
      const truck = await Truck.findById(truckId);
      if (!truck) {
        throw new Error('Truck not found');
      }

      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        status
      } = query;

      // Build filter
      const filter = { truck: truckId };
      
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }
      
      if (status) {
        filter.status = status;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const [drives, total] = await Promise.all([
        Drive.find(filter)
          .populate('driver', 'fullName phone')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Drive.countDocuments(filter)
      ]);

      const pages = Math.ceil(total / limit);

      logger.info(`Retrieved ${drives.length} drives for truck ${truck.plateNumber}`, {
        truckId,
        filter,
        pagination: { page, limit, total, pages }
      });

      return {
        truck: {
          _id: truck._id,
          plateNumber: truck.plateNumber,
          make: truck.make,
          model: truck.model
        },
        drives,
        pagination: {
          current: page,
          pages,
          total,
          limit
        }
      };
    } catch (error) {
      logger.error(`Error getting drives for truck ${truckId}:`, error);
      if (error.message === 'Truck not found') {
        throw error;
      }
      throw new Error('Failed to retrieve truck drives');
    }
  }

  // Get truck statistics
  async getTruckStats() {
    try {
      const [
        totalTrucks,
        activeTrucks,
        maintenanceTrucks,
        inactiveTrucks,
        trucksDueForService,
        trucksByMake
      ] = await Promise.all([
        Truck.countDocuments(),
        Truck.countDocuments({ status: 'active' }),
        Truck.countDocuments({ status: 'maintenance' }),
        Truck.countDocuments({ status: 'inactive' }),
        Truck.findDueForService().countDocuments(),
        Truck.aggregate([
          { $group: { _id: '$make', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

      const stats = {
        total: totalTrucks,
        active: activeTrucks,
        maintenance: maintenanceTrucks,
        inactive: inactiveTrucks,
        dueForService: trucksDueForService,
        topMakes: trucksByMake
      };

      logger.info('Retrieved truck statistics', stats);
      return stats;
    } catch (error) {
      logger.error('Error getting truck statistics:', error);
      throw new Error('Failed to retrieve truck statistics');
    }
  }

  // Get trucks by status
  async getTrucksByStatus(status) {
    try {
      const trucks = await Truck.findByStatus(status).lean();
      
      logger.info(`Retrieved ${trucks.length} trucks with status: ${status}`);
      return trucks;
    } catch (error) {
      logger.error(`Error getting trucks by status ${status}:`, error);
      throw new Error('Failed to retrieve trucks by status');
    }
  }

  // Get trucks due for service
  async getTrucksDueForService() {
    try {
      const trucks = await Truck.findDueForService().lean();
      
      logger.info(`Retrieved ${trucks.length} trucks due for service`);
      return trucks;
    } catch (error) {
      logger.error('Error getting trucks due for service:', error);
      throw new Error('Failed to retrieve trucks due for service');
    }
  }
}

export default new TruckService();