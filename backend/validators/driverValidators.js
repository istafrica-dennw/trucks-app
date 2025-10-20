import Joi from 'joi';

// Driver ID validation
export const driverId = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid driver ID format'
  })
});

// Get all drivers validation
export const getAllDrivers = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(''),
  status: Joi.string().valid('active', 'inactive', 'suspended').allow(''),
  sortBy: Joi.string().valid('fullName', 'phone', 'hireDate', 'status').default('fullName'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// Create driver validation
export const createDriver = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters'
  }),
  phone: Joi.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please enter a valid phone number'
  }),
  email: Joi.string().email().trim().lowercase().allow('').messages({
    'string.email': 'Please enter a valid email address'
  }),
  nationalId: Joi.string().trim().min(5).max(20).required().messages({
    'string.empty': 'National ID is required',
    'string.min': 'National ID must be at least 5 characters',
    'string.max': 'National ID cannot exceed 20 characters'
  }),
  licenseNumber: Joi.string().trim().min(5).max(20).required().messages({
    'string.empty': 'License number is required',
    'string.min': 'License number must be at least 5 characters',
    'string.max': 'License number cannot exceed 20 characters'
  }),
  address: Joi.string().trim().min(5).max(200).required().messages({
    'string.empty': 'Address is required',
    'string.min': 'Address must be at least 5 characters',
    'string.max': 'Address cannot exceed 200 characters'
  }),
  hireDate: Joi.date().max('now').messages({
    'date.max': 'Hire date cannot be in the future'
  }),
  status: Joi.string().valid('active', 'inactive', 'suspended').default('active')
});

// Update driver validation
export const updateDriver = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters'
  }),
  phone: Joi.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
    'string.pattern.base': 'Please enter a valid phone number'
  }),
  email: Joi.string().email().trim().lowercase().allow('').messages({
    'string.email': 'Please enter a valid email address'
  }),
  nationalId: Joi.string().trim().min(5).max(20).messages({
    'string.min': 'National ID must be at least 5 characters',
    'string.max': 'National ID cannot exceed 20 characters'
  }),
  licenseNumber: Joi.string().trim().min(5).max(20).messages({
    'string.min': 'License number must be at least 5 characters',
    'string.max': 'License number cannot exceed 20 characters'
  }),
  address: Joi.string().trim().min(5).max(200).messages({
    'string.min': 'Address must be at least 5 characters',
    'string.max': 'Address cannot exceed 200 characters'
  }),
  hireDate: Joi.date().max('now').messages({
    'date.max': 'Hire date cannot be in the future'
  }),
  status: Joi.string().valid('active', 'inactive', 'suspended')
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});