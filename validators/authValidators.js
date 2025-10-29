import Joi from 'joi';

// Common validation patterns
const passwordPattern = Joi.string().min(6).max(128);
const usernamePattern = Joi.string().min(3).max(30).trim().pattern(/^[a-zA-Z0-9_]+$/);
const objectIdPattern = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// Auth validation schemas
const authValidators = {
  // Login validation
  login: Joi.object({
    login: usernamePattern
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
        'any.required': 'Password is required'
      })
  }),

  // Profile update validation
  updateProfile: Joi.object({
    username: usernamePattern
      .optional()
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      })
  }).min(1).messages({
    'object.min': 'At least one field (username) must be provided for update'
  }),

  // User ID parameter validation
  userId: Joi.object({
    id: objectIdPattern
      .required()
      .messages({
        'string.pattern.base': 'Invalid user ID format',
        'any.required': 'User ID is required'
      })
  })
};

export default authValidators;