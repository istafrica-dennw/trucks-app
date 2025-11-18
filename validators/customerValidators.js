import Joi from 'joi';

// List of countries for validation
const countries = [
  'Rwanda', 'Uganda', 'Tanzania', 'Kenya', 'Burundi', 'DRC', 'South Sudan',
  'Ethiopia', 'Somalia', 'Sudan', 'Eritrea', 'Djibouti', 'Other'
];

// Customer ID validation
export const customerId = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid customer ID format'
  })
});

// Get all customers validation
export const getAllCustomers = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(10),
  search: Joi.string().trim().max(100).allow(''),
  country: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('name', 'country', 'phone', 'createdAt').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// Create customer validation
export const createCustomer = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Customer name is required',
    'string.min': 'Customer name must be at least 2 characters',
    'string.max': 'Customer name cannot exceed 100 characters'
  }),
  country: Joi.string().valid(...countries).required().messages({
    'any.only': `Country must be one of: ${countries.join(', ')}`,
    'any.required': 'Country is required'
  }),
  phone: Joi.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please enter a valid phone number'
  })
});

// Update customer validation
export const updateCustomer = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Customer name must be at least 2 characters',
    'string.max': 'Customer name cannot exceed 100 characters'
  }),
  country: Joi.string().valid(...countries).messages({
    'any.only': `Country must be one of: ${countries.join(', ')}`
  }),
  phone: Joi.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
    'string.pattern.base': 'Please enter a valid phone number'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

