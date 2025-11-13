import Joi from 'joi';

// Common validation patterns
const passwordPattern = Joi.string().min(6).max(128);
const usernamePattern = Joi.string().min(3).max(30).trim().pattern(/^[a-zA-Z0-9_]+$/);
const objectIdPattern = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// User validation schemas
const userValidators = {
  // Get all users query validation
  getAllUsers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid('admin', 'user', 'officer').optional(),
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
    username: usernamePattern
      .required()
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
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
    username: usernamePattern
      .optional()
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    role: Joi.string()
      .valid('admin', 'user', 'officer')
      .optional()
      .messages({
        'any.only': 'Role must be either admin, user, or officer'
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