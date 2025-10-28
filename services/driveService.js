import Drive from '../models/Drive.js';
import Driver from '../models/Driver.js';
import Truck from '../models/Truck.js';
import logger from '../utils/logger.js';

export const getAllDrives = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      truckId = '',
      driverId = '',
      customer = '',
      departureCity = '',
      destinationCity = '',
      paidOption = '',
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = filters;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { customer: { $regex: search, $options: 'i' } },
        { cargo: { $regex: search, $options: 'i' } },
        { departureCity: { $regex: search, $options: 'i' } },
        { destinationCity: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (truckId) {
      query.truck = truckId;
    }
    
    if (driverId) {
      query.driver = driverId;
    }
    
    if (customer) {
      query.customer = { $regex: customer, $options: 'i' };
    }
    
    if (departureCity) {
      query.departureCity = { $regex: departureCity, $options: 'i' };
    }
    
    if (destinationCity) {
      query.destinationCity = { $regex: destinationCity, $options: 'i' };
    }
    
    if (paidOption) {
      query['pay.paidOption'] = paidOption;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Drive.countDocuments(query);

    logger.info('Retrieved drives list', {
      total,
      page,
      limit,
      search,
      status,
      truckId,
      driverId
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
    logger.error('Error retrieving drives', { error: error.message });
    throw error;
  }
};

export const getDriveById = async (driveId) => {
  try {
    const drive = await Drive.findById(driveId)
      .populate('driver', 'fullName phone email nationalId licenseNumber')
      .populate('truck', 'plateNumber make model year status')
      .populate('createdBy', 'email');
    
    if (!drive) {
      logger.warn('Drive not found', { driveId });
      return null;
    }

    logger.info('Retrieved drive details', { driveId });
    return drive;
  } catch (error) {
    logger.error('Error retrieving drive', { driveId, error: error.message });
    throw error;
  }
};

export const createDrive = async (driveData, userId) => {
  try {
    // Verify driver exists
    const driver = await Driver.findById(driveData.driver);
    if (!driver) {
      logger.warn('Drive creation failed - driver not found', { driverId: driveData.driver });
      throw new Error('Driver not found');
    }

    // Verify truck exists
    const truck = await Truck.findById(driveData.truck);
    if (!truck) {
      logger.warn('Drive creation failed - truck not found', { truckId: driveData.truck });
      throw new Error('Truck not found');
    }

    // Validate payment structure
    if (driveData.pay.paidOption === 'full') {
      driveData.pay.installments = [];
    }

    // Add createdBy
    driveData.createdBy = userId;

    const drive = new Drive(driveData);
    await drive.save();

    // Populate the created drive
    const populatedDrive = await Drive.findById(drive._id)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .lean();

    logger.info('Drive created successfully', { 
      driveId: drive._id,
      driver: drive.driver,
      truck: drive.truck,
      customer: drive.customer
    });

    return populatedDrive;
  } catch (error) {
    logger.error('Error creating drive', { error: error.message });
    throw error;
  }
};

export const updateDrive = async (driveId, updateData) => {
  try {
    const drive = await Drive.findById(driveId);
    
    if (!drive) {
      logger.warn('Drive update failed - drive not found', { driveId });
      throw new Error('Drive not found');
    }

    // Validate payment structure if being updated
    if (updateData.pay) {
      if (updateData.pay.paidOption === 'full') {
        updateData.pay.installments = [];
      }
    }

    // Update drive
    Object.assign(drive, updateData);
    await drive.save();

    // Populate the updated drive
    const populatedDrive = await Drive.findById(driveId)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .lean();

    logger.info('Drive updated successfully', { 
      driveId,
      customer: drive.customer
    });

    return populatedDrive;
  } catch (error) {
    logger.error('Error updating drive', { driveId, error: error.message });
    throw error;
  }
};

export const deleteDrive = async (driveId) => {
  try {
    const drive = await Drive.findById(driveId);
    
    if (!drive) {
      logger.warn('Drive deletion failed - drive not found', { driveId });
      throw new Error('Drive not found');
    }

    await Drive.findByIdAndDelete(driveId);

    logger.info('Drive deleted successfully', { 
      driveId,
      customer: drive.customer
    });

    return { message: 'Drive deleted successfully' };
  } catch (error) {
    logger.error('Error deleting drive', { driveId, error: error.message });
    throw error;
  }
};

export const addInstallment = async (driveId, installmentData) => {
  try {
    const drive = await Drive.findById(driveId);
    
    if (!drive) {
      logger.warn('Installment addition failed - drive not found', { driveId });
      throw new Error('Drive not found');
    }

    if (drive.pay.paidOption !== 'installment') {
      logger.warn('Installment addition failed - not an installment payment', { driveId });
      throw new Error('Cannot add installment to non-installment payment');
    }

    // Add installment using the model method
    await drive.addInstallment(installmentData);

    // Populate the updated drive
    const populatedDrive = await Drive.findById(driveId)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .lean();

    logger.info('Installment added successfully', { 
      driveId,
      installmentAmount: installmentData.amount
    });

    return populatedDrive;
  } catch (error) {
    logger.error('Error adding installment', { driveId, error: error.message });
    throw error;
  }
};

export const getDriveStats = async () => {
  try {
    const total = await Drive.countDocuments();
    const started = await Drive.countDocuments({ status: 'started' });
    const completed = await Drive.countDocuments({ status: 'completed' });
    const fullPayment = await Drive.countDocuments({ 'pay.paidOption': 'full' });
    const installmentPayment = await Drive.countDocuments({ 'pay.paidOption': 'installment' });

    // Get recent journeys (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentJourneys = await Drive.countDocuments({
      date: { $gte: thirtyDaysAgo }
    });

    // Calculate total amounts
    const totalAmountResult = await Drive.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$pay.totalAmount' },
          totalExpenses: { $sum: { $sum: '$expenses.amount' } }
        }
      }
    ]);

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;
    const totalExpenses = totalAmountResult[0]?.totalExpenses || 0;

    const stats = {
      total,
      started,
      completed,
      fullPayment,
      installmentPayment,
      recentJourneys,
      totalAmount,
      totalExpenses,
      netProfit: totalAmount - totalExpenses
    };

    logger.info('Retrieved drive statistics', stats);
    return stats;
  } catch (error) {
    logger.error('Error retrieving drive statistics', { error: error.message });
    throw error;
  }
};

export const getDrivesByTruck = async (truckId, filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status = ''
    } = filters;

    // Build query
    const query = { truck: truckId };
    
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

    // Execute query
    const drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Drive.countDocuments(query);

    logger.info('Retrieved drives by truck', { 
      truckId,
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
    logger.error('Error retrieving drives by truck', { truckId, error: error.message });
    throw error;
  }
};

export const getDrivesByDriver = async (driverId, filters = {}) => {
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

    // Execute query
    const drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Drive.countDocuments(query);

    logger.info('Retrieved drives by driver', { 
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
    logger.error('Error retrieving drives by driver', { driverId, error: error.message });
    throw error;
  }
};

export const getDrivesByDate = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const drives = await Drive.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort({ date: -1 })
      .lean();

    logger.info('Retrieved drives by date', { 
      date,
      count: drives.length
    });

    return drives;
  } catch (error) {
    logger.error('Error retrieving drives by date', { date, error: error.message });
    throw error;
  }
};