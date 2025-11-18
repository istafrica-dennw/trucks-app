import Customer from '../models/Customer.js';
import Drive from '../models/Drive.js';
import logger from '../utils/logger.js';

export const getAllCustomers = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      country = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (country) {
      query.country = country;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Customer.countDocuments(query);

    logger.info('Retrieved customers list', {
      total,
      page,
      limit,
      search,
      country
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error retrieving customers', { error: error.message });
    throw error;
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId).lean();
    
    if (!customer) {
      logger.warn('Customer not found', { customerId });
      return null;
    }

    logger.info('Retrieved customer details', { customerId });
    return customer;
  } catch (error) {
    logger.error('Error retrieving customer', { customerId, error: error.message });
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    // Check for duplicate phone
    const existingPhone = await Customer.findOne({ phone: customerData.phone });
    if (existingPhone) {
      logger.warn('Customer creation failed - duplicate phone', { phone: customerData.phone });
      throw new Error('Phone number already exists');
    }

    const customer = new Customer(customerData);
    await customer.save();

    logger.info('Customer created successfully', { 
      customerId: customer._id,
      name: customer.name,
      phone: customer.phone
    });

    return customer;
  } catch (error) {
    logger.error('Error creating customer', { error: error.message });
    throw error;
  }
};

export const updateCustomer = async (customerId, updateData) => {
  try {
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      logger.warn('Customer update failed - customer not found', { customerId });
      throw new Error('Customer not found');
    }

    // Check for duplicate phone if being updated
    if (updateData.phone && updateData.phone !== customer.phone) {
      const existingPhone = await Customer.findOne({ 
        phone: updateData.phone,
        _id: { $ne: customerId }
      });
      if (existingPhone) {
        logger.warn('Customer update failed - duplicate phone', { customerId, phone: updateData.phone });
        throw new Error('Phone number already exists');
      }
    }

    // Update customer
    Object.assign(customer, updateData);
    await customer.save();

    logger.info('Customer updated successfully', { 
      customerId,
      name: customer.name,
      phone: customer.phone
    });

    return customer;
  } catch (error) {
    logger.error('Error updating customer', { customerId, error: error.message });
    throw error;
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      logger.warn('Customer deletion failed - customer not found', { customerId });
      throw new Error('Customer not found');
    }

    // Check if customer has associated drives
    const drivesCount = await Drive.countDocuments({ customer: customerId });
    if (drivesCount > 0) {
      logger.warn('Customer deletion failed - has associated drives', { customerId, drivesCount });
      throw new Error(`Cannot delete customer. They have ${drivesCount} associated journey(s).`);
    }

    await Customer.findByIdAndDelete(customerId);

    logger.info('Customer deleted successfully', { 
      customerId,
      name: customer.name,
      phone: customer.phone
    });

    return { message: 'Customer deleted successfully' };
  } catch (error) {
    logger.error('Error deleting customer', { customerId, error: error.message });
    throw error;
  }
};

export const getCustomerStats = async () => {
  try {
    const total = await Customer.countDocuments();
    
    // Get customers by country
    const customersByCountry = await Customer.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const stats = {
      total,
      byCountry: customersByCountry
    };

    logger.info('Retrieved customer statistics', stats);
    return stats;
  } catch (error) {
    logger.error('Error retrieving customer statistics', { error: error.message });
    throw error;
  }
};

