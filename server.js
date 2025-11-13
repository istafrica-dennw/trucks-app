import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

// Import logger
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import truckRoutes from './routes/trucks.js';
import driverRoutes from './routes/drivers.js';
import driveRoutes from './routes/drives.js';
import reportRoutes from './routes/reports.js';
import activityRoutes from './routes/activities.js';
import settingsRoutes from './routes/settings.js';
import testRoutes from './routes/test.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { 
  requestLogger, 
  errorLogger, 
  securityLogger, 
  rateLimitLogger, 
  authLogger, 
  dbLogger, 
  businessLogger 
} from './middleware/requestLogger.js';

// Import utils
import createDefaultAdmin from './utils/createDefaultAdmin.js';
import connectDB from './config/database.js';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting (disabled in development)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
}

// CORS configuration (allow any origin, common headers/methods)
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/settings', settingsRoutes);
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

// Create default admin user after database connection
const initializeApp = async () => {
  await createDefaultAdmin();
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initializeApp();
  
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
};

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

startServer();