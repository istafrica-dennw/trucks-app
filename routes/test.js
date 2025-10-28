import express from 'express';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

const router = express.Router();

// Simple test model for storing a string
const testSchema = new mongoose.Schema({
  testString: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create a model that will always use the same document
const TestModel = mongoose.model('Test', testSchema);

// Test endpoint to trigger various log types
router.get('/logs', async (req, res) => {
  try {
    logger.info('Test endpoint accessed', {
      endpoint: '/test/logs',
      method: 'GET',
      timestamp: new Date().toISOString()
    });

    // Test different log levels
    logger.debug('Debug log test - This is debug information', {
      testData: { message: 'Debug test successful' }
    });

    logger.info('Info log test - General information', {
      testData: { message: 'Info test successful' }
    });

    logger.warn('Warning log test - This is a warning', {
      testData: { message: 'Warning test successful' }
    });

    // Test context-specific logging
    logger.auth('Authentication test log', {
      userId: 'test-user-123',
      action: 'test-authentication'
    });

    logger.database('Database test log', {
      operation: 'test-query',
      collection: 'test-collection',
      duration: '5ms'
    });

    logger.api('API test log', {
      endpoint: '/test/logs',
      method: 'GET',
      statusCode: 200
    });

    logger.email('Email test log', {
      to: 'test@example.com',
      subject: 'Test Email',
      status: 'sent'
    });

    logger.security('Security test log', {
      event: 'test-security-event',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.performance('Performance test log', {
      operation: 'test-operation',
      duration: '10ms'
    });

    logger.business('Business test log', {
      action: 'test-business-action',
      userId: 'test-user-123'
    });

    // Test user action logging
    logger.userAction('Test Action', 'test-user-123', {
      resource: 'test-resource',
      action: 'test-action'
    });

    // Test system event logging
    logger.systemEvent('Test System Event', {
      event: 'test-event',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'All log types tested successfully',
      timestamp: new Date().toISOString(),
      logsGenerated: [
        'info',
        'debug', 
        'warn',
        'auth',
        'database',
        'api',
        'email',
        'security',
        'performance',
        'business',
        'userAction',
        'systemEvent'
      ]
    });

  } catch (error) {
    logger.error('Error in test endpoint', {
      error: error.message,
      stack: error.stack,
      endpoint: '/test/logs'
    });

    res.status(500).json({
      success: false,
      message: 'Error testing logs',
      error: error.message
    });
  }
});

// Test endpoint to trigger an error log
router.get('/error', async (req, res) => {
  try {
    logger.info('Error test endpoint accessed', {
      endpoint: '/test/error',
      method: 'GET'
    });

    // Intentionally throw an error to test error logging
    throw new Error('This is a test error to demonstrate error logging');

  } catch (error) {
    logger.errorWithContext(error, {
      endpoint: '/test/error',
      method: 'GET',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(500).json({
      success: false,
      message: 'Test error triggered successfully',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to trigger performance logging
router.get('/performance', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Performance test endpoint accessed', {
      endpoint: '/test/performance',
      method: 'GET'
    });

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));

    const duration = Date.now() - startTime;
    
    logger.performance('Performance test completed', {
      endpoint: '/test/performance',
      duration: `${duration}ms`,
      operation: 'test-performance'
    });

    res.json({
      success: true,
      message: 'Performance test completed',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Error in performance test', {
      error: error.message,
      duration: `${duration}ms`,
      endpoint: '/test/performance'
    });

    res.status(500).json({
      success: false,
      message: 'Error in performance test',
      error: error.message
    });
  }
});

// Test endpoint to trigger security logging
router.get('/security', async (req, res) => {
  try {
    logger.info('Security test endpoint accessed', {
      endpoint: '/test/security',
      method: 'GET'
    });

    // Test suspicious activity detection
    const suspiciousInput = '<script>alert("xss")</script>';
    
    logger.security('Suspicious input detected', {
      input: suspiciousInput,
      endpoint: '/test/security',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Security test completed',
      suspiciousInput: suspiciousInput,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in security test', {
      error: error.message,
      endpoint: '/test/security'
    });

    res.status(500).json({
      success: false,
      message: 'Error in security test',
      error: error.message
    });
  }
});

// Test endpoint to trigger database logging
router.get('/database', async (req, res) => {
  try {
    logger.info('Database test endpoint accessed', {
      endpoint: '/test/database',
      method: 'GET'
    });

    // Simulate database operations
    const startTime = Date.now();
    
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const duration = Date.now() - startTime;
    
    logger.query('SELECT * FROM test_table', 'test_collection', duration, {
      endpoint: '/test/database',
      operation: 'test-query'
    });

    res.json({
      success: true,
      message: 'Database test completed',
      queryDuration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in database test', {
      error: error.message,
      endpoint: '/test/database'
    });

    res.status(500).json({
      success: false,
      message: 'Error in database test',
      error: error.message
    });
  }
});

// Simple test API endpoints
// POST /test - Store a string (overwrites existing)
router.post('/', async (req, res) => {
  try {
    const { testString } = req.body;
    
    if (!testString) {
      return res.status(400).json({
        success: false,
        message: 'testString is required'
      });
    }

    logger.info('Test string POST request', {
      endpoint: '/test',
      method: 'POST',
      testString: testString
    });

    // Find and update the single test document, or create if it doesn't exist
    const result = await TestModel.findOneAndUpdate(
      {}, // Empty filter to find any document
      { testString: testString },
      { 
        upsert: true, // Create if doesn't exist
        new: true,    // Return updated document
        runValidators: true
      }
    );

    logger.info('Test string stored successfully', {
      testString: result.testString,
      documentId: result._id,
      timestamp: result.updatedAt
    });

    res.json({
      success: true,
      message: 'Test string stored successfully',
      data: {
        testString: result.testString,
        id: result._id,
        updatedAt: result.updatedAt
      }
    });

  } catch (error) {
    logger.error('Error storing test string', {
      error: error.message,
      stack: error.stack,
      endpoint: '/test',
      method: 'POST'
    });

    res.status(500).json({
      success: false,
      message: 'Error storing test string',
      error: error.message
    });
  }
});

// GET /test - Retrieve the stored string
router.get('/', async (req, res) => {
  try {
    logger.info('Test string GET request', {
      endpoint: '/test',
      method: 'GET'
    });

    // Find the single test document
    const result = await TestModel.findOne({});

    if (!result) {
      logger.info('No test string found', {
        endpoint: '/test',
        method: 'GET'
      });

      return res.json({
        success: true,
        message: 'No test string stored yet',
        data: {
          testString: null,
          id: null,
          updatedAt: null
        }
      });
    }

    logger.info('Test string retrieved successfully', {
      testString: result.testString,
      documentId: result._id,
      timestamp: result.updatedAt
    });

    res.json({
      success: true,
      message: 'Test string retrieved successfully',
      data: {
        testString: result.testString,
        id: result._id,
        updatedAt: result.updatedAt
      }
    });

  } catch (error) {
    logger.error('Error retrieving test string', {
      error: error.message,
      stack: error.stack,
      endpoint: '/test',
      method: 'GET'
    });

    res.status(500).json({
      success: false,
      message: 'Error retrieving test string',
      error: error.message
    });
  }
});

export default router;