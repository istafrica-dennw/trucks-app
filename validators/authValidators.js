import Joi from 'joi';

// Common validation patterns
const emailPattern = Joi.string().email().trim().lowercase();
const phonePattern = Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).trim();
const passwordPattern = Joi.string().min(6).max(128);
const usernamePattern = Joi.string().min(3).max(30).trim();
const objectIdPattern = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// Auth validation schemas
const authValidators = {
  // Login validation
  login: Joi.object({
    login: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        // Check if it's a valid email or phone
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (emailRegex.test(value)) {
          return value.toLowerCase();
        } else if (phoneRegex.test(value)) {
          return value;
        } else {
          return helpers.error('alternatives.match');
        }
      })
      .messages({
        'alternatives.match': 'Login must be a valid email address or phone number',
        'any.required': 'Login field is required (email or phone)'
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
    email: emailPattern
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    phone: phonePattern
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }).min(1).messages({
    'object.min': 'At least one field (email or phone) must be provided for update'
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