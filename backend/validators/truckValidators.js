import Joi from 'joi';

// Common validation patterns
const plateNumberPattern = /^[A-Z0-9\-\s]+$/;
const currentYear = new Date().getFullYear();

// Truck ID validation
export const truckId = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid truck ID format',
    'any.required': 'Truck ID is required'
  })
});

// Get all trucks query validation
export const getAllTrucks = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('active', 'maintenance', 'inactive').optional(),
  make: Joi.string().trim().optional(),
  search: Joi.string().trim().optional()
});

// Create truck validation
export const createTruck = Joi.object({
  plateNumber: Joi.string()
    .pattern(plateNumberPattern)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid plate number (letters, numbers, hyphens, and spaces only)',
      'any.required': 'Plate number is required'
    }),
  make: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Truck make is required',
      'string.min': 'Truck make must be at least 1 character',
      'string.max': 'Truck make cannot exceed 50 characters',
      'any.required': 'Truck make is required'
    }),
  model: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Truck model is required',
      'string.min': 'Truck model must be at least 1 character',
      'string.max': 'Truck model cannot exceed 50 characters',
      'any.required': 'Truck model is required'
    }),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(currentYear + 1)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be after 1900',
      'number.max': 'Year cannot be in the future',
      'any.required': 'Manufacturing year is required'
    }),
  capacity: Joi.number()
    .min(1)
    .max(100000)
    .required()
    .messages({
      'number.base': 'Capacity must be a number',
      'number.min': 'Capacity must be greater than 0',
      'number.max': 'Capacity cannot exceed 100,000',
      'any.required': 'Truck capacity is required'
    }),
  fuelType: Joi.string()
    .valid('diesel', 'petrol', 'electric', 'hybrid')
    .default('diesel')
    .messages({
      'any.only': 'Fuel type must be one of: diesel, petrol, electric, hybrid'
    }),
  status: Joi.string()
    .valid('active', 'maintenance', 'inactive')
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, maintenance, inactive'
    }),
  notes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  vin: Joi.string()
    .trim()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .optional()
    .messages({
      'string.length': 'VIN must be exactly 17 characters',
      'string.pattern.base': 'Please enter a valid VIN'
    }),
  color: Joi.string()
    .trim()
    .max(30)
    .optional()
    .messages({
      'string.max': 'Color cannot exceed 30 characters'
    }),
  mileage: Joi.number()
    .min(0)
    .max(9999999)
    .optional()
    .messages({
      'number.base': 'Mileage must be a number',
      'number.min': 'Mileage cannot be negative',
      'number.max': 'Mileage cannot exceed 9,999,999'
    }),
  lastServiceDate: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.base': 'Last service date must be a valid date',
      'date.max': 'Last service date cannot be in the future'
    }),
  nextServiceDate: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Next service date must be a valid date',
      'date.min': 'Next service date must be in the future'
    }),
  insuranceExpiry: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Insurance expiry must be a valid date',
      'date.min': 'Insurance expiry must be in the future'
    }),
  registrationExpiry: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Registration expiry must be a valid date',
      'date.min': 'Registration expiry must be in the future'
    })
});

// Update truck validation (all fields optional except ID)
export const updateTruck = Joi.object({
  plateNumber: Joi.string()
    .pattern(plateNumberPattern)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid plate number (letters, numbers, hyphens, and spaces only)'
    }),
  make: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Truck make cannot be empty',
      'string.min': 'Truck make must be at least 1 character',
      'string.max': 'Truck make cannot exceed 50 characters'
    }),
  model: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Truck model cannot be empty',
      'string.min': 'Truck model must be at least 1 character',
      'string.max': 'Truck model cannot exceed 50 characters'
    }),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(currentYear + 1)
    .optional()
    .messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be after 1900',
      'number.max': 'Year cannot be in the future'
    }),
  capacity: Joi.number()
    .min(1)
    .max(100000)
    .optional()
    .messages({
      'number.base': 'Capacity must be a number',
      'number.min': 'Capacity must be greater than 0',
      'number.max': 'Capacity cannot exceed 100,000'
    }),
  fuelType: Joi.string()
    .valid('diesel', 'petrol', 'electric', 'hybrid')
    .optional()
    .messages({
      'any.only': 'Fuel type must be one of: diesel, petrol, electric, hybrid'
    }),
  status: Joi.string()
    .valid('active', 'maintenance', 'inactive')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, maintenance, inactive'
    }),
  notes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  vin: Joi.string()
    .trim()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .allow('')
    .optional()
    .messages({
      'string.length': 'VIN must be exactly 17 characters',
      'string.pattern.base': 'Please enter a valid VIN'
    }),
  color: Joi.string()
    .trim()
    .max(30)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Color cannot exceed 30 characters'
    }),
  mileage: Joi.number()
    .min(0)
    .max(9999999)
    .optional()
    .messages({
      'number.base': 'Mileage must be a number',
      'number.min': 'Mileage cannot be negative',
      'number.max': 'Mileage cannot exceed 9,999,999'
    }),
  lastServiceDate: Joi.date()
    .max('now')
    .allow(null)
    .optional()
    .messages({
      'date.base': 'Last service date must be a valid date',
      'date.max': 'Last service date cannot be in the future'
    }),
  nextServiceDate: Joi.date()
    .min('now')
    .allow(null)
    .optional()
    .messages({
      'date.base': 'Next service date must be a valid date',
      'date.min': 'Next service date must be in the future'
    }),
  insuranceExpiry: Joi.date()
    .min('now')
    .allow(null)
    .optional()
    .messages({
      'date.base': 'Insurance expiry must be a valid date',
      'date.min': 'Insurance expiry must be in the future'
    }),
  registrationExpiry: Joi.date()
    .min('now')
    .allow(null)
    .optional()
    .messages({
      'date.base': 'Registration expiry must be a valid date',
      'date.min': 'Registration expiry must be in the future'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export default {
  truckId,
  getAllTrucks,
  createTruck,
  updateTruck
};