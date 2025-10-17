import logger from '../utils/logger.js';

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request start
  logger.debug('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    userRole: req.user ? req.user.role : null,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log request completion
    logger.request(req, res, responseTime);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  // Log error with request context
  logger.errorWithContext(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    userRole: req.user ? req.user.role : null,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined
    }
  });

  next(err);
};

// Security event logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
  ];

  const url = req.originalUrl;
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body) || pattern.test(query)) {
      logger.security('Suspicious activity detected', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user._id : null,
        pattern: pattern.toString(),
        body: req.body,
        query: req.query
      });
      break;
    }
  }

  next();
};

// Rate limiting logger
const rateLimitLogger = (req, res, next) => {
  // Log rate limit violations
  if (res.get('X-RateLimit-Remaining') === '0') {
    logger.security('Rate limit exceeded', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : null,
      limit: res.get('X-RateLimit-Limit'),
      remaining: res.get('X-RateLimit-Remaining'),
      reset: res.get('X-RateLimit-Reset')
    });
  }

  next();
};

// Authentication logger
const authLogger = (req, res, next) => {
  // Log authentication attempts
  if (req.path.includes('/auth/login')) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const isSuccess = res.statusCode === 200;
      
      logger.auth('Login attempt', {
        email: req.body.email || req.body.phone,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: isSuccess,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`
      });
    });
  }

  // Log logout events
  if (req.path.includes('/auth/logout')) {
    logger.auth('User logout', {
      userId: req.user ? req.user._id : null,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  next();
};

// Database operation logger
const dbLogger = (req, res, next) => {
  // Log database operations
  const originalSend = res.send;
  res.send = function(data) {
    // Log successful database operations
    if (res.statusCode < 400) {
      logger.database('Database operation completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userId: req.user ? req.user._id : null,
        userRole: req.user ? req.user.role : null
      });
    }
    
    originalSend.call(this, data);
  };

  next();
};

// Business logic logger
const businessLogger = (req, res, next) => {
  // Log business operations
  const businessEndpoints = [
    '/api/drives',
    '/api/trucks',
    '/api/drivers',
    '/api/users'
  ];

  const isBusinessEndpoint = businessEndpoints.some(endpoint => 
    req.originalUrl.startsWith(endpoint)
  );

  if (isBusinessEndpoint) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      logger.business('Business operation', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user ? req.user._id : null,
        userRole: req.user ? req.user.role : null,
        resource: req.originalUrl.split('/')[2] // Extract resource type
      });
    });
  }

  next();
};

export {
  requestLogger,
  errorLogger,
  securityLogger,
  rateLimitLogger,
  authLogger,
  dbLogger,
  businessLogger
};