#!/usr/bin/env node

// Demo script to show logging in action
console.log('🚀 Starting Logging Demo...\n');

// Load environment variables
require('dotenv').config();

// Import logger
const logger = require('./utils/logger');

console.log('📝 Testing different log levels:\n');

// Test different log levels
logger.debug('Debug: This is debug information', {
  context: 'demo',
  timestamp: new Date().toISOString(),
  data: { test: 'debug message' }
});

logger.info('Info: General application information', {
  context: 'demo',
  timestamp: new Date().toISOString(),
  data: { test: 'info message' }
});

logger.warn('Warning: This is a warning message', {
  context: 'demo',
  timestamp: new Date().toISOString(),
  data: { test: 'warning message' }
});

logger.error('Error: This is an error message', {
  context: 'demo',
  timestamp: new Date().toISOString(),
  data: { test: 'error message' }
});

console.log('\n🔐 Testing context-specific logging:\n');

// Test context-specific logging
logger.auth('User login attempt', {
  userId: 'demo-user-123',
  email: 'demo@example.com',
  ip: '127.0.0.1',
  success: true
});

logger.database('Database query executed', {
  operation: 'find',
  collection: 'users',
  duration: '15ms',
  query: { email: 'demo@example.com' }
});

logger.api('API request processed', {
  method: 'GET',
  endpoint: '/api/users',
  statusCode: 200,
  responseTime: '25ms'
});

logger.email('Email sent successfully', {
  to: 'demo@example.com',
  subject: 'Welcome to Truck Management System',
  status: 'sent'
});

logger.security('Security event detected', {
  event: 'login_attempt',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0 (Demo Browser)',
  suspicious: false
});

logger.performance('Performance metric recorded', {
  operation: 'user_authentication',
  duration: '45ms',
  memoryUsage: '25MB'
});

logger.business('Business event occurred', {
  action: 'create_drive',
  userId: 'demo-user-123',
  truckId: 'truck-456',
  driverId: 'driver-789'
});

console.log('\n👤 Testing user action logging:\n');

logger.userAction('Create Drive', 'demo-user-123', {
  resource: 'drive',
  action: 'create',
  truckId: 'truck-456',
  driverId: 'driver-789'
});

console.log('\n⚙️ Testing system event logging:\n');

logger.systemEvent('System startup', {
  event: 'server_start',
  timestamp: new Date().toISOString(),
  version: '1.0.0'
});

console.log('\n🔍 Testing error with context:\n');

// Test error logging with context
try {
  throw new Error('Demo error for testing error logging');
} catch (error) {
  logger.errorWithContext(error, {
    context: 'demo',
    endpoint: '/demo/error',
    method: 'GET',
    ip: '127.0.0.1'
  });
}

console.log('\n📊 Testing performance logging:\n');

// Test performance logging
const startTime = Date.now();
setTimeout(() => {
  const duration = Date.now() - startTime;
  
  logger.performance('Demo operation completed', {
    operation: 'demo_operation',
    duration: `${duration}ms`,
    context: 'demo'
  });
  
  console.log('\n✅ Logging demo completed!');
  console.log('\n📁 Check the logs/ directory for generated log files:');
  console.log('   📄 logs/error.log     - Error logs');
  console.log('   📄 logs/debug.log     - Debug logs');
  console.log('   📄 logs/info.log      - Info logs');
  console.log('   📄 logs/combined.log  - All logs combined');
  console.log('\n🔍 You can view the logs with:');
  console.log('   cat logs/info.log');
  console.log('   tail -f logs/combined.log');
  console.log('   grep "ERROR" logs/combined.log');
  
  process.exit(0);
}, 100);