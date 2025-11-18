import Joi from 'joi';

// Drive ID validation
export const driveId = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid drive ID format'
  })
});

// Generic ObjectId validation - accepts any param name
export const objectIdParam = Joi.object().unknown(true).pattern(
  Joi.string(),
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format'
  })
);

// Get all drives validation
export const getAllDrives = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(''),
  status: Joi.string().valid('started', 'completed').allow(''),
  truckId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(''),
  driverId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(''),
  customer: Joi.string().trim().max(100).allow(''),
  departureCity: Joi.string().trim().max(100).allow(''),
  destinationCity: Joi.string().trim().max(100).allow(''),
  paidOption: Joi.string().valid('full', 'installment').allow(''),
  startDate: Joi.date().allow(''),
  endDate: Joi.date().allow(''),
  sortBy: Joi.string().valid('date', 'totalAmount', 'balance', 'customer', 'departureCity', 'destinationCity').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Expense validation
const expenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Expense title is required',
    'string.min': 'Expense title must be at least 1 character',
    'string.max': 'Expense title cannot exceed 100 characters'
  }),
  amount: Joi.number().min(0).required().messages({
    'number.min': 'Expense amount cannot be negative',
    'number.base': 'Expense amount must be a number'
  }),
  note: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Expense note cannot exceed 200 characters'
  })
});

// Installment validation
const installmentSchema = Joi.object({
  amount: Joi.number().min(0).required().messages({
    'number.min': 'Installment amount cannot be negative',
    'number.base': 'Installment amount must be a number'
  }),
  date: Joi.date().max('now').default(Date.now).messages({
    'date.max': 'Installment date cannot be in the future'
  }),
  note: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Installment note cannot exceed 200 characters'
  })
});

// Payment validation
const paymentSchema = Joi.object({
  totalAmount: Joi.number().min(0).required().messages({
    'number.min': 'Total amount cannot be negative',
    'number.base': 'Total amount must be a number'
  }),
  currency: Joi.string().valid('USD', 'RWF', 'UGX', 'TZX').default('RWF').messages({
    'any.only': 'Currency must be USD, RWF, UGX, or TZX'
  }),
  exchangeRate: Joi.number().min(0.01).default(1).messages({
    'number.min': 'Exchange rate must be greater than 0',
    'number.base': 'Exchange rate must be a number'
  }),
  paidOption: Joi.string().valid('full', 'installment').required().messages({
    'any.only': 'Payment option must be either "full" or "installment"'
  }),
  installments: Joi.array().items(installmentSchema).when('paidOption', {
    is: 'installment',
    then: Joi.array().min(0),
    otherwise: Joi.array().max(0)
  })
});

// Create drive validation
export const createDrive = Joi.object({
  driver: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid driver ID format'
  }),
  truck: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid truck ID format'
  }),
  departureCity: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Departure city is required',
    'string.min': 'Departure city must be at least 1 character',
    'string.max': 'Departure city cannot exceed 100 characters'
  }),
  destinationCity: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Destination city is required',
    'string.min': 'Destination city must be at least 1 character',
    'string.max': 'Destination city cannot exceed 100 characters'
  }),
  cargo: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Cargo is required',
    'string.min': 'Cargo must be at least 1 character',
    'string.max': 'Cargo cannot exceed 200 characters'
  }),
  customer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid customer ID format',
    'any.required': 'Customer is required'
  }),
  expenses: Joi.array().items(expenseSchema).default([]),
  pay: paymentSchema.required(),
  notes: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters'
  }),
  status: Joi.string().valid('started', 'completed').default('started'),
  date: Joi.date().max('now').default(Date.now).messages({
    'date.max': 'Journey date cannot be in the future'
  })
});

// Update drive validation
export const updateDrive = Joi.object({
  driver: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid driver ID format'
  }),
  truck: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid truck ID format'
  }),
  departureCity: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Departure city must be at least 1 character',
    'string.max': 'Departure city cannot exceed 100 characters'
  }),
  destinationCity: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Destination city must be at least 1 character',
    'string.max': 'Destination city cannot exceed 100 characters'
  }),
  cargo: Joi.string().trim().min(1).max(200).messages({
    'string.min': 'Cargo must be at least 1 character',
    'string.max': 'Cargo cannot exceed 200 characters'
  }),
  customer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid customer ID format'
  }),
  expenses: Joi.array().items(expenseSchema),
  pay: paymentSchema,
  notes: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters'
  }),
  status: Joi.string().valid('started', 'completed'),
  date: Joi.date().max('now').messages({
    'date.max': 'Journey date cannot be in the future'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Add installment validation
export const addInstallment = Joi.object({
  amount: Joi.number().min(0).required().messages({
    'number.min': 'Installment amount cannot be negative',
    'number.base': 'Installment amount must be a number'
  }),
  date: Joi.date().max('now').default(Date.now).messages({
    'date.max': 'Installment date cannot be in the future'
  }),
  note: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Installment note cannot exceed 200 characters'
  })
});

// Date range validation
export const dateRange = Joi.object({
  startDate: Joi.date().required().messages({
    'date.base': 'Start date must be a valid date'
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date'
  })
});