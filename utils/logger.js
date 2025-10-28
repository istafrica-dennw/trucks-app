import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    if (stack) {
      log.stack = stack;
    }
    
    return JSON.stringify(log);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Create transports array
const transports = [];

// Console transport (for development)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug'
    })
  );
}

// Error log file transport
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  })
);

// Debug log file transport
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'debug-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'debug',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true
  })
);

// Info log file transport
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'info-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

// Combined log file transport (all levels)
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'trucks-app-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    format: logFormat
  })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    format: logFormat
  })
);

// Custom logging methods for different contexts
logger.auth = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'authentication' });
};

logger.database = (message, meta = {}) => {
  logger.debug(message, { ...meta, context: 'database' });
};

logger.api = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'api' });
};

logger.email = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'email' });
};

logger.security = (message, meta = {}) => {
  logger.warn(message, { ...meta, context: 'security' });
};

logger.performance = (message, meta = {}) => {
  logger.debug(message, { ...meta, context: 'performance' });
};

logger.business = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'business' });
};

// Request logging helper
logger.request = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    userRole: req.user ? req.user.role : null
  };

  if (res.statusCode >= 400) {
    logger.error('HTTP Request Error', logData);
  } else if (res.statusCode >= 300) {
    logger.warn('HTTP Request Redirect', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Error logging helper
logger.errorWithContext = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context
  });
};

// Performance logging helper
logger.performance = (operation, duration, meta = {}) => {
  logger.debug(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...meta
  });
};

// Database query logging helper
logger.query = (operation, collection, duration, meta = {}) => {
  logger.database(`Database Query: ${operation}`, {
    collection,
    duration: `${duration}ms`,
    ...meta
  });
};

// User action logging helper
logger.userAction = (action, userId, meta = {}) => {
  logger.business(`User Action: ${action}`, {
    userId,
    action,
    ...meta
  });
};

// System event logging helper
logger.systemEvent = (event, meta = {}) => {
  logger.info(`System Event: ${event}`, {
    event,
    ...meta
  });
};

export default logger;