import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} from '../services/customerService.js';
import logger from '../utils/logger.js';

export const getAllCustomersController = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      country: req.query.country || '',
      sortBy: req.query.sortBy || 'name',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const result = await getAllCustomers(filters);

    res.status(200).json({
      success: true,
      data: result.customers,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getAllCustomersController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers',
      error: error.message
    });
  }
};

export const getCustomerByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Error in getCustomerByIdController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer',
      error: error.message
    });
  }
};

export const createCustomerController = async (req, res) => {
  try {
    const customerData = req.body;
    const customer = await createCustomer(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    logger.error('Error in createCustomerController', { error: error.message });
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

export const updateCustomerController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const customer = await updateCustomer(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    logger.error('Error in updateCustomerController', { error: error.message });
    
    if (error.message === 'Customer not found') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
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
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

export const deleteCustomerController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCustomer(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in deleteCustomerController', { error: error.message });
    
    if (error.message === 'Customer not found') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (error.message.includes('associated journey')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

export const getCustomerStatsController = async (req, res) => {
  try {
    const stats = await getCustomerStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getCustomerStatsController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer statistics',
      error: error.message
    });
  }
};

