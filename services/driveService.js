import Drive from '../models/Drive.js';
import Driver from '../models/Driver.js';
import Truck from '../models/Truck.js';
import Customer from '../models/Customer.js';
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
        { cargo: { $regex: search, $options: 'i' } },
        { departureCity: { $regex: search, $options: 'i' } },
        { destinationCity: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
      // Note: Customer search is now done via populated field, so we search by customer name through aggregation
      // For now, we'll exclude customer from text search since it's now a reference
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
      // Customer is now an ObjectId reference, so we match by ID
      query.customer = customer;
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

    // Execute query - fetch without customer populate first to avoid ObjectId casting errors
    const mongoose = (await import('mongoose')).default;
    let drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Manually populate valid customer ObjectIds only
    for (const drive of drives) {
      if (drive.customer) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(drive.customer)) {
          try {
            const customer = await Customer.findById(drive.customer).select('name phone country').lean();
            drive.customer = customer;
          } catch (err) {
            // Invalid customer reference, set to null
            logger.warn('Invalid customer ObjectId in drive', { driveId: drive._id, customer: drive.customer });
            drive.customer = null;
          }
        } else {
          // Not a valid ObjectId (likely old string value), set to null
          logger.warn('Customer field is not a valid ObjectId', { driveId: drive._id, customer: drive.customer });
          drive.customer = null;
        }
      }
    }

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
    // Fetch without customer populate first to avoid ObjectId casting errors
    const mongoose = (await import('mongoose')).default;
    const drive = await Drive.findById(driveId)
      .populate('driver', 'fullName phone email nationalId licenseNumber')
      .populate('truck', 'plateNumber make model year status')
      .populate('createdBy', 'email')
      .lean();
    
    if (!drive) {
      logger.warn('Drive not found', { driveId });
      return null;
    }
    
    // Manually populate customer if it's a valid ObjectId
    if (drive.customer) {
      if (mongoose.Types.ObjectId.isValid(drive.customer)) {
        try {
          const customer = await Customer.findById(drive.customer).select('name phone country').lean();
          drive.customer = customer;
        } catch (err) {
          logger.warn('Invalid customer ObjectId in drive', { driveId, customer: drive.customer });
          drive.customer = null;
        }
      } else {
        logger.warn('Customer field is not a valid ObjectId', { driveId, customer: drive.customer });
        drive.customer = null;
      }
    }
    
    // Ensure balance is recalculated using the virtual (in case stored balance is outdated)
    // The virtual will be included in toJSON/toObject, but we also update the stored value
    const totalPaid = drive.totalPaid || 0;
    const totalExpensesRWF = drive.totalExpenses || 0;
    const currency = drive.pay?.currency || 'RWF';
    const exchangeRate = drive.pay?.exchangeRate || 1;
    
    let totalExpensesInCurrency = totalExpensesRWF;
    if (currency !== 'RWF') {
      totalExpensesInCurrency = totalExpensesRWF / exchangeRate;
    }
    
    // Update balance if it's different (to fix any old incorrect balances)
    const correctBalance = totalPaid - totalExpensesInCurrency;
    if (Math.abs(drive.balance - correctBalance) > 0.01) {
      drive.balance = correctBalance;
      // Save without triggering validation to avoid infinite loops
      await Drive.findByIdAndUpdate(driveId, { balance: correctBalance }, { runValidators: false });
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

    // Verify customer exists
    const customer = await Customer.findById(driveData.customer);
    if (!customer) {
      logger.warn('Drive creation failed - customer not found', { customerId: driveData.customer });
      throw new Error('Customer not found');
    }

    // Validate payment structure
    if (driveData.pay.paidOption === 'full') {
      driveData.pay.installments = [];
    }

    // Add createdBy
    driveData.createdBy = userId;

    const drive = new Drive(driveData);
    await drive.save();

    // Populate the created drive - manually populate customer to handle edge cases
    const mongoose = (await import('mongoose')).default;
    const populatedDrive = await Drive.findById(drive._id)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .lean();
    
    // Manually populate customer if it's a valid ObjectId
    if (populatedDrive.customer && mongoose.Types.ObjectId.isValid(populatedDrive.customer)) {
      try {
        const customer = await Customer.findById(populatedDrive.customer).select('name phone country').lean();
        populatedDrive.customer = customer;
      } catch (err) {
        logger.warn('Invalid customer ObjectId in drive', { driveId: populatedDrive._id, customer: populatedDrive.customer });
        populatedDrive.customer = null;
      }
    }

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

    // Check if trying to complete journey with incomplete payment
    if (updateData.status === 'completed' && drive.status !== 'completed') {
      const totalPaid = drive.totalPaid || 0;
      const totalAmount = drive.pay.totalAmount || 0;
      
      if (totalPaid < totalAmount) {
        logger.warn('Journey completion blocked - payment incomplete', {
          driveId,
          totalAmount,
          totalPaid,
          remaining: totalAmount - totalPaid
        });
        throw new Error(`Cannot complete journey. Payment incomplete. Total required: $${totalAmount.toFixed(2)}, Total paid: $${totalPaid.toFixed(2)}, Remaining: $${(totalAmount - totalPaid).toFixed(2)}`);
      }
    }

    // Validate payment structure if being updated
    if (updateData.pay) {
      if (updateData.pay.paidOption === 'full') {
        updateData.pay.installments = [];
      } else if (updateData.pay.installments && Array.isArray(updateData.pay.installments)) {
        // Preserve existing attachments when updating installments
        updateData.pay.installments = updateData.pay.installments.map((newInst, index) => {
          // If this installment already exists at this index, preserve its attachment
          const existingInst = drive.pay.installments && drive.pay.installments[index];
          const installmentData = { ...newInst };
          
          // Only include attachment if it has all required fields
          if (newInst.attachment && newInst.attachment.filename && newInst.attachment.path) {
            // New attachment is complete, use it
            installmentData.attachment = newInst.attachment;
          } else if (existingInst && existingInst.attachment && existingInst.attachment.filename && existingInst.attachment.path) {
            // Preserve existing attachment if new data doesn't have it or has incomplete attachment data
            installmentData.attachment = existingInst.attachment;
          }
          // If neither has a valid attachment, don't include the attachment field
          
          return installmentData;
        });
      }
    }

    // Update drive - preserve existing installment attachments and full payment attachment
    if (updateData.pay) {
      drive.pay.totalAmount = updateData.pay.totalAmount ?? drive.pay.totalAmount;
      drive.pay.currency = updateData.pay.currency ?? drive.pay.currency ?? 'RWF';
      drive.pay.exchangeRate = updateData.pay.exchangeRate ?? drive.pay.exchangeRate ?? 1;
      drive.pay.paidOption = updateData.pay.paidOption ?? drive.pay.paidOption;
      
      // Handle full payment attachment
      if (updateData.pay.paidOption === 'full') {
        // If new attachment is provided, use it; otherwise preserve existing
        if (updateData.pay.attachment && updateData.pay.attachment.filename) {
          drive.pay.attachment = updateData.pay.attachment;
        } else if (!updateData.pay.attachment && drive.pay.attachment) {
          // Preserve existing attachment if no new one is provided
          drive.pay.attachment = drive.pay.attachment;
        }
      } else {
        // For installment payments, clear full payment attachment
        drive.pay.attachment = undefined;
      }
      
      if (updateData.pay.installments !== undefined) {
        // Merge installments carefully to preserve existing attachments
        const updatedInstallments = updateData.pay.installments.map((newInst, index) => {
          // Check if we have an existing installment at this index
          const existingInst = drive.pay.installments && drive.pay.installments[index];
          
          // If existing installment has attachment and new one doesn't have complete attachment, preserve it
          if (existingInst && existingInst.attachment && 
              (!newInst.attachment || !newInst.attachment.filename || !newInst.attachment.path)) {
            return {
              amount: parseFloat(newInst.amount),
              date: newInst.date ? new Date(newInst.date) : existingInst.date,
              attachment: existingInst.attachment // Preserve existing attachment
            };
          }
          
          // Otherwise use new installment data (which should have attachment if it's a new one)
          const installmentData = {
            amount: parseFloat(newInst.amount),
            date: newInst.date ? new Date(newInst.date) : new Date()
          };
          
          // Only include attachment if it has all required fields
          if (newInst.attachment && newInst.attachment.filename && newInst.attachment.path) {
            installmentData.attachment = newInst.attachment;
          } else if (existingInst?.attachment && existingInst.attachment.filename && existingInst.attachment.path) {
            installmentData.attachment = existingInst.attachment;
          }
          // If neither has a valid attachment, don't include the attachment field
          
          return installmentData;
        });
        
        drive.pay.installments = updatedInstallments;
      }
    }
    
    // Update expenses - preserve existing attachments
    if (updateData.expenses !== undefined) {
      drive.expenses = updateData.expenses.map((newExpense, index) => {
        const existingExpense = drive.expenses && drive.expenses[index];
        
        // If existing expense has attachment and new one doesn't have complete attachment data, preserve it
        if (existingExpense && existingExpense.attachment && 
            (!newExpense.attachment || !newExpense.attachment.filename || !newExpense.attachment.path)) {
          return {
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            note: newExpense.note || '',
            attachment: existingExpense.attachment
          };
        }
        
        // Otherwise use new expense data (with attachment if provided)
        return {
          title: newExpense.title,
          amount: parseFloat(newExpense.amount),
          note: newExpense.note || '',
          attachment: newExpense.attachment || existingExpense?.attachment
        };
      });
    }
    
    // Update other fields
    const fieldsToUpdate = ['driver', 'truck', 'departureCity', 'destinationCity', 'cargo', 'customer', 'notes', 'status', 'date'];
    fieldsToUpdate.forEach(field => {
      if (updateData[field] !== undefined) {
        drive[field] = updateData[field];
      }
    });
    
    await drive.save();

    // Populate the updated drive - manually populate customer to handle edge cases
    const mongoose = (await import('mongoose')).default;
    const populatedDrive = await Drive.findById(driveId)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .lean();
    
    // Manually populate customer if it's a valid ObjectId
    if (populatedDrive.customer && mongoose.Types.ObjectId.isValid(populatedDrive.customer)) {
      try {
        const customer = await Customer.findById(populatedDrive.customer).select('name phone country').lean();
        populatedDrive.customer = customer;
      } catch (err) {
        logger.warn('Invalid customer ObjectId in drive', { driveId, customer: populatedDrive.customer });
        populatedDrive.customer = null;
      }
    }

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

    // Populate the updated drive - manually populate customer to handle edge cases
    const mongoose = (await import('mongoose')).default;
    const populatedDrive = await Drive.findById(driveId)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .lean();
    
    // Manually populate customer if it's a valid ObjectId
    if (populatedDrive.customer && mongoose.Types.ObjectId.isValid(populatedDrive.customer)) {
      try {
        const customer = await Customer.findById(populatedDrive.customer).select('name phone country').lean();
        populatedDrive.customer = customer;
      } catch (err) {
        logger.warn('Invalid customer ObjectId in drive', { driveId, customer: populatedDrive.customer });
        populatedDrive.customer = null;
      }
    }

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

    // Execute query - fetch without customer populate first to avoid ObjectId casting errors
    const mongoose = (await import('mongoose')).default;
    let drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Manually populate valid customer ObjectIds only
    for (const drive of drives) {
      if (drive.customer) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(drive.customer)) {
          try {
            const customer = await Customer.findById(drive.customer).select('name phone country').lean();
            drive.customer = customer;
          } catch (err) {
            // Invalid customer reference, set to null
            logger.warn('Invalid customer ObjectId in drive', { driveId: drive._id, customer: drive.customer });
            drive.customer = null;
          }
        } else {
          // Not a valid ObjectId (likely old string value), set to null
          logger.warn('Customer field is not a valid ObjectId', { driveId: drive._id, customer: drive.customer });
          drive.customer = null;
        }
      }
    }

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

    // Execute query - fetch without customer populate first to avoid ObjectId casting errors
    const mongoose = (await import('mongoose')).default;
    let drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Manually populate valid customer ObjectIds only
    for (const drive of drives) {
      if (drive.customer) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(drive.customer)) {
          try {
            const customer = await Customer.findById(drive.customer).select('name phone country').lean();
            drive.customer = customer;
          } catch (err) {
            // Invalid customer reference, set to null
            logger.warn('Invalid customer ObjectId in drive', { driveId: drive._id, customer: drive.customer });
            drive.customer = null;
          }
        } else {
          // Not a valid ObjectId (likely old string value), set to null
          logger.warn('Customer field is not a valid ObjectId', { driveId: drive._id, customer: drive.customer });
          drive.customer = null;
        }
      }
    }

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

export const getDrivesByCustomer = async (customerId, filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status = ''
    } = filters;

    // Build query
    const query = { customer: customerId };
    
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

    // Execute query - fetch without customer populate first to avoid ObjectId casting errors
    const mongoose = (await import('mongoose')).default;
    let drives = await Drive.find(query)
      .populate('driver', 'fullName phone')
      .populate('truck', 'plateNumber make model')
      .populate('createdBy', 'email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Manually populate valid customer ObjectIds only
    for (const drive of drives) {
      if (drive.customer) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(drive.customer)) {
          try {
            const customer = await Customer.findById(drive.customer).select('name phone country').lean();
            drive.customer = customer;
          } catch (err) {
            // Invalid customer reference, set to null
            logger.warn('Invalid customer ObjectId in drive', { driveId: drive._id, customer: drive.customer });
            drive.customer = null;
          }
        } else {
          // Not a valid ObjectId (likely old string value), set to null
          logger.warn('Customer field is not a valid ObjectId', { driveId: drive._id, customer: drive.customer });
          drive.customer = null;
        }
      }
    }

    const total = await Drive.countDocuments(query);

    logger.info('Retrieved drives by customer', { 
      customerId,
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
    logger.error('Error retrieving drives by customer', { customerId, error: error.message });
    throw error;
  }
};

export const getDrivesByDate = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Execute query - fetch without customer populate first to avoid ObjectId casting errors
    const mongoose = (await import('mongoose')).default;
    let drives = await Drive.find({
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
    
    // Manually populate valid customer ObjectIds only
    for (const drive of drives) {
      if (drive.customer) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(drive.customer)) {
          try {
            const customer = await Customer.findById(drive.customer).select('name phone country').lean();
            drive.customer = customer;
          } catch (err) {
            // Invalid customer reference, set to null
            logger.warn('Invalid customer ObjectId in drive', { driveId: drive._id, customer: drive.customer });
            drive.customer = null;
          }
        } else {
          // Not a valid ObjectId (likely old string value), set to null
          logger.warn('Customer field is not a valid ObjectId', { driveId: drive._id, customer: drive.customer });
          drive.customer = null;
        }
      }
    }

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