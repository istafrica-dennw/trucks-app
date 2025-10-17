import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

class AuthService {
  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  }

  /**
   * Login user with email/phone and password
   * @param {string} login - Email or phone number
   * @param {string} password - User password
   * @returns {Object} User data and token
   */
  async login(login, password) {
    try {
      // Find user by email or phone (explicitly select password field)
      const user = await User.findOne({
        $or: [
          { email: login },
          { phone: login }
        ]
      }).select('+password');

      if (!user) {
        logger.security('Login attempt failed - user not found', {
          login: login,
          ip: 'unknown' // Will be set by controller
        });
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        logger.security('Login attempt failed - user inactive', {
          userId: user._id,
          login: login,
          ip: 'unknown'
        });
        throw new Error('Account is deactivated');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.security('Login attempt failed - invalid password', {
          userId: user._id,
          login: login,
          ip: 'unknown'
        });
        throw new Error('Invalid credentials');
      }

      // Update last login
      await user.updateLastLogin();

      // Generate token
      const token = this.generateToken(user._id);

      // Log successful login
      logger.auth('User login successful', {
        userId: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ip: 'unknown'
      });

      // Return user data (without password) and token
      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin
      };

      return {
        user: userData,
        token
      };
    } catch (error) {
      logger.error('Login service error', {
        error: error.message,
        login: login,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }

      logger.auth('User profile accessed', {
        userId: user._id,
        username: user.username,
        role: user.role,
        ip: 'unknown'
      });

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Get user profile service error', {
        error: error.message,
        userId: userId,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user data
   */
  async updateUserProfile(userId, updateData) {
    try {
      const { email, phone } = updateData;

      // Check for duplicate email
      if (email) {
        const existingUser = await User.findOne({ 
          email: email, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          throw new Error('Email already exists');
        }
      }

      // Check for duplicate phone
      if (phone) {
        const existingUser = await User.findOne({ 
          phone: phone, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          throw new Error('Phone number already exists');
        }
      }

      // Prepare update data
      const updateFields = {};
      if (email) {
        updateFields.email = email;
        updateFields.emailVerified = false; // Reset email verification if email changed
      }
      if (phone) {
        updateFields.phone = phone;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      logger.auth('User profile updated', {
        userId: user._id,
        username: user.username,
        updatedFields: Object.keys(updateFields),
        ip: 'unknown'
      });

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Update user profile service error', {
        error: error.message,
        userId: userId,
        updateData: updateData,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Logout user (client-side token removal)
   * @param {string} userId - User ID
   * @returns {Object} Logout confirmation
   */
  async logout(userId) {
    try {
      logger.auth('User logout', {
        userId: userId,
        ip: 'unknown'
      });

      return {
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Logout service error', {
        error: error.message,
        userId: userId,
        stack: error.stack
      });
      throw error;
    }
  }
}

export default new AuthService();