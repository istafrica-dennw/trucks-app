import Joi from 'joi';

// Common validation patterns
const emailPattern = Joi.string().email().trim().lowercase();
const phonePattern = Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).trim();
const passwordPattern = Joi.string().min(6).max(128);
const usernamePattern = Joi.string().min(3).max(30).trim();
const objectIdPattern = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// User validation schemas
const userValidators = {
  // Get all users query validation
  getAllUsers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid('admin', 'user').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().trim().max(100).optional()
  }),

  // User ID parameter validation
  userId: Joi.object({
    id: objectIdPattern
      .required()
      .messages({
        'string.pattern.base': 'Invalid user ID format',
        'any.required': 'User ID is required'
      })
  }),

  // Create user validation
  createUser: Joi.object({
    email: emailPattern
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    phone: phonePattern
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      }),
    password: passwordPattern
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required'
      })
  }),

  // Update user validation
  updateUser: Joi.object({
    email: emailPattern
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    phone: phonePattern
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    role: Joi.string()
      .valid('admin', 'user')
      .optional()
      .messages({
        'any.only': 'Role must be either admin or user'
      }),
    isActive: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isActive must be a boolean value'
      })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

export default userValidators;