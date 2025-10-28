import User from '../models/User.js';
import logger from './logger.js';

const createDefaultAdmin = async () => {
  try {
    // Check if default admin credentials are provided
    const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME;
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const defaultPhone = process.env.DEFAULT_ADMIN_PHONE;
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!defaultUsername || !defaultEmail || !defaultPhone || !defaultPassword) {
      logger.warn('Default admin credentials not provided in environment variables');
      return;
    }

    // Check if default admin user already exists (by email or username)
    const existingDefaultAdmin = await User.findOne({ 
      $or: [
        { email: defaultEmail },
        { username: defaultUsername },
        { isDefaultAdmin: true }
      ]
    });
    
    if (existingDefaultAdmin) {
      logger.info('Default admin user already exists, skipping creation', {
        existingAdminId: existingDefaultAdmin._id,
        existingAdminEmail: existingDefaultAdmin.email,
        existingAdminUsername: existingDefaultAdmin.username
      });
      return;
    }

    // Create default admin user
    const adminUser = await User.create({
      username: defaultUsername,
      email: defaultEmail,
      phone: defaultPhone,
      password: defaultPassword,
      role: 'admin',
      isActive: true,
      isDefaultAdmin: true,
      emailVerified: true // Skip email verification for default admin
    });

    logger.info('Default admin user created successfully', {
      adminId: adminUser._id,
      username: adminUser.username,
      email: adminUser.email,
      phone: adminUser.phone,
      role: adminUser.role,
      isDefaultAdmin: adminUser.isDefaultAdmin
    });
    
    console.log('Default admin user created successfully:');
    console.log(`Username: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Phone: ${adminUser.phone}`);
    console.log('Please change the default password after first login!');

  } catch (error) {
    logger.error('Error creating default admin user', {
      error: error.message,
      stack: error.stack
    });
    console.error('Error creating default admin user:', error.message);
  }
};

export default createDefaultAdmin;