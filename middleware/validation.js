import Joi from 'joi';
import logger from '../utils/logger.js';

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Return all validation errors
        stripUnknown: true, // Remove unknown properties
        allowUnknown: false // Don't allow unknown properties
      });

      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Validation failed', {
          property: property,
          errors: errorDetails,
          originalData: req[property],
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorDetails
        });
      }

      // Replace the original property with the validated and sanitized value
      req[property] = value;
      next();
    } catch (err) {
      logger.error('Validation middleware error', {
        error: err.message,
        property: property,
        stack: err.stack
      });

      return res.status(500).json({
        success: false,
        message: 'Internal validation error'
      });
    }
  };
};

/**
 * Validate request body
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate request query parameters
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate request path parameters
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => validate(schema, 'params');

export {
  validate,
  validateBody,
  validateQuery,
  validateParams
};