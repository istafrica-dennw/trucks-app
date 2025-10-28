import Driver from '../models/Driver.js';
import Drive from '../models/Drive.js';
import logger from '../utils/logger.js';

export const getAllDrivers = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'fullName',
      sortOrder = 'asc'
    } = filters;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const drivers = await Driver.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Driver.countDocuments(query);

    logger.info('Retrieved drivers list', {
      total,
      page,
      limit,
      search,
      status
    });

    return {
      drivers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error retrieving drivers', { error: error.message });
    throw error;
  }
};

export const getDriverById = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId).lean();
    
    if (!driver) {
      logger.warn('Driver not found', { driverId });
      return null;
    }

    logger.info('Retrieved driver details', { driverId });
    return driver;
  } catch (error) {
    logger.error('Error retrieving driver', { driverId, error: error.message });
    throw error;
  }
};

export const createDriver = async (driverData) => {
  try {
    // Check for duplicate phone
    const existingPhone = await Driver.findOne({ phone: driverData.phone });
    if (existingPhone) {
      logger.warn('Driver creation failed - duplicate phone', { phone: driverData.phone });
      throw new Error('Phone number already exists');
    }

    // Check for duplicate email if provided
    if (driverData.email) {
      const existingEmail = await Driver.findOne({ email: driverData.email });
      if (existingEmail) {
        logger.warn('Driver creation failed - duplicate email', { email: driverData.email });
        throw new Error('Email already exists');
      }
    }

    // Check for duplicate national ID
    const existingNationalId = await Driver.findOne({ nationalId: driverData.nationalId });
    if (existingNationalId) {
      logger.warn('Driver creation failed - duplicate national ID', { nationalId: driverData.nationalId });
      throw new Error('National ID already exists');
    }

    // Check for duplicate license number
    const existingLicense = await Driver.findOne({ licenseNumber: driverData.licenseNumber });
    if (existingLicense) {
      logger.warn('Driver creation failed - duplicate license number', { licenseNumber: driverData.licenseNumber });
      throw new Error('License number already exists');
    }

    const driver = new Driver(driverData);
    await driver.save();

    logger.info('Driver created successfully', { 
      driverId: driver._id,
      fullName: driver.fullName,
      phone: driver.phone
    });

    return driver;
  } catch (error) {
    logger.error('Error creating driver', { error: error.message });
    throw error;
  }
};

export const updateDriver = async (driverId, updateData) => {
  try {
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      logger.warn('Driver update failed - driver not found', { driverId });
      throw new Error('Driver not found');
    }

    // Check for duplicate phone if being updated
    if (updateData.phone && updateData.phone !== driver.phone) {
      const existingPhone = await Driver.findOne({ 
        phone: updateData.phone,
        _id: { $ne: driverId }
      });
      if (existingPhone) {
        logger.warn('Driver update failed - duplicate phone', { driverId, phone: updateData.phone });
        throw new Error('Phone number already exists');
      }
    }

    // Check for duplicate email if being updated
    if (updateData.email && updateData.email !== driver.email) {
      const existingEmail = await Driver.findOne({ 
        email: updateData.email,
        _id: { $ne: driverId }
      });
      if (existingEmail) {
        logger.warn('Driver update failed - duplicate email', { driverId, email: updateData.email });
        throw new Error('Email already exists');
      }
    }

    // Check for duplicate national ID if being updated
    if (updateData.nationalId && updateData.nationalId !== driver.nationalId) {
      const existingNationalId = await Driver.findOne({ 
        nationalId: updateData.nationalId,
        _id: { $ne: driverId }
      });
      if (existingNationalId) {
        logger.warn('Driver update failed - duplicate national ID', { driverId, nationalId: updateData.nationalId });
        throw new Error('National ID already exists');
      }
    }

    // Check for duplicate license number if being updated
    if (updateData.licenseNumber && updateData.licenseNumber !== driver.licenseNumber) {
      const existingLicense = await Driver.findOne({ 
        licenseNumber: updateData.licenseNumber,
        _id: { $ne: driverId }
      });
      if (existingLicense) {
        logger.warn('Driver update failed - duplicate license number', { driverId, licenseNumber: updateData.licenseNumber });
        throw new Error('License number already exists');
      }
    }

    // Update driver
    Object.assign(driver, updateData);
    await driver.save();

    logger.info('Driver updated successfully', { 
      driverId,
      fullName: driver.fullName,
      phone: driver.phone
    });

    return driver;
  } catch (error) {
    logger.error('Error updating driver', { driverId, error: error.message });
    throw error;
  }
};

export const deleteDriver = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      logger.warn('Driver deletion failed - driver not found', { driverId });
      throw new Error('Driver not found');
    }

    // Check if driver has associated drives
    const drivesCount = await Drive.countDocuments({ driver: driverId });
    if (drivesCount > 0) {
      logger.warn('Driver deletion failed - has associated drives', { driverId, drivesCount });
      throw new Error(`Cannot delete driver. They have ${drivesCount} associated drive(s).`);
    }

    await Driver.findByIdAndDelete(driverId);

    logger.info('Driver deleted successfully', { 
      driverId,
      fullName: driver.fullName,
      phone: driver.phone
    });

    return { message: 'Driver deleted successfully' };
  } catch (error) {
    logger.error('Error deleting driver', { driverId, error: error.message });
    throw error;
  }
};

export const getDriverDrives = async (driverId, filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status = ''
    } = filters;

    // Build query
    const query = { driver: driverId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with truck population
    const drives = await Drive.find(query)
      .populate('truck', 'plateNumber make model')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Drive.countDocuments(query);

    logger.info('Retrieved driver drives', { 
      driverId,
      total,
      page,
      limit
    });

    return {
      drives,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error retrieving driver drives', { driverId, error: error.message });
    throw error;
  }
};

export const getDriverStats = async () => {
  try {
    const total = await Driver.countDocuments();
    const active = await Driver.countDocuments({ status: 'active' });
    const inactive = await Driver.countDocuments({ status: 'inactive' });
    const suspended = await Driver.countDocuments({ status: 'suspended' });

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = await Driver.countDocuments({
      hireDate: { $gte: thirtyDaysAgo }
    });

    const stats = {
      total,
      active,
      inactive,
      suspended,
      recentHires
    };

    logger.info('Retrieved driver statistics', stats);
    return stats;
  } catch (error) {
    logger.error('Error retrieving driver statistics', { error: error.message });
    throw error;
  }
};

export const getDriversByStatus = async (status) => {
  try {
    const drivers = await Driver.find({ status })
      .select('fullName phone email status hireDate')
      .sort({ fullName: 1 })
      .lean();

    logger.info('Retrieved drivers by status', { status, count: drivers.length });
    return drivers;
  } catch (error) {
    logger.error('Error retrieving drivers by status', { status, error: error.message });
    throw error;
  }
};