const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import logger
const logger = require('./utils/logger');

// Import test routes
const testRoutes = require('./routes/test');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { 
  requestLogger, 
  errorLogger, 
  securityLogger, 
  rateLimitLogger, 
  authLogger, 
  dbLogger, 
  businessLogger 
} = require('./middleware/requestLogger');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);
app.use(securityLogger);
app.use(rateLimitLogger);
app.use(authLogger);
app.use(dbLogger);
app.use(businessLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test routes
app.use('/test', testRoutes);

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  logger.info(`Test server running on port ${PORT}`);
  logger.info(`Environment: development`);
  logger.info(`Frontend URL: http://localhost:5173`);
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📝 Test logging endpoints:`);
  console.log(`   GET http://localhost:${PORT}/test/logs`);
  console.log(`   GET http://localhost:${PORT}/test/error`);
  console.log(`   GET http://localhost:${PORT}/test/performance`);
  console.log(`   GET http://localhost:${PORT}/test/security`);
  console.log(`   GET http://localhost:${PORT}/test/database`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});