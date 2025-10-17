import User from '../models/User.js';
import logger from '../utils/logger.js';

class UserService {
  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Object} Users and pagination info
   */
  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role = null,
        isActive = null,
        search = null
      } = options;

      // Build query
      const query = {};
      
      if (role) {
        query.role = role;
      }
      
      if (isActive !== null) {
        query.isActive = isActive;
      }
      
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      logger.info('Users retrieved', {
        count: users.length,
        total: total,
        page: page,
        limit: limit,
        filters: { role, isActive, search }
      });

      return {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total: total,
          limit: limit
        }
      };
    } catch (error) {
      logger.error('Get all users service error', {
        error: error.message,
        options: options,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} User data
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }

      logger.info('User retrieved by ID', {
        userId: user._id,
        username: user.username,
        role: user.role
      });

      return user;
    } catch (error) {
      logger.error('Get user by ID service error', {
        error: error.message,
        userId: userId,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  async createUser(userData) {
    try {
      const { username, email, phone, password, role = 'user' } = userData;

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [
          { email: email },
          { phone: phone }
        ]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new Error('Email already exists');
        }
        if (existingUser.phone === phone) {
          throw new Error('Phone number already exists');
        }
      }

      // Create user
      const user = await User.create({
        username,
        email,
        phone,
        password,
        role,
        isActive: true,
        emailVerified: false
      });

      logger.info('User created', {
        userId: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      });

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;
      return userResponse;
    } catch (error) {
      logger.error('Create user service error', {
        error: error.message,
        userData: { ...userData, password: '[HIDDEN]' },
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      const { username, email, phone, role, isActive } = updateData;

      // Check for duplicate email/phone
      if (email || phone) {
        const query = { _id: { $ne: userId } };
        if (email && phone) {
          query.$or = [{ email }, { phone }];
        } else if (email) {
          query.email = email;
        } else if (phone) {
          query.phone = phone;
        }

        const existingUser = await User.findOne(query);
        if (existingUser) {
          if (existingUser.email === email) {
            throw new Error('Email already exists');
          }
          if (existingUser.phone === phone) {
            throw new Error('Phone number already exists');
          }
        }
      }

      // Prepare update data
      const updateFields = {};
      if (username) updateFields.username = username;
      if (email) {
        updateFields.email = email;
        updateFields.emailVerified = false; // Reset email verification
      }
      if (phone) updateFields.phone = phone;
      if (role) updateFields.role = role;
      if (isActive !== undefined) updateFields.isActive = isActive;

      const user = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      logger.info('User updated', {
        userId: user._id,
        username: user.username,
        updatedFields: Object.keys(updateFields)
      });

      return user;
    } catch (error) {
      logger.error('Update user service error', {
        error: error.message,
        userId: userId,
        updateData: updateData,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Object} Deletion result
   */
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent deletion of default admin
      if (user.isDefaultAdmin) {
        throw new Error('Cannot delete default admin user');
      }

      await User.findByIdAndDelete(userId);

      logger.info('User deleted', {
        userId: userId,
        username: user.username,
        email: user.email
      });

      return {
        message: 'User deleted successfully',
        deletedUser: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      };
    } catch (error) {
      logger.error('Delete user service error', {
        error: error.message,
        userId: userId,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Object} User statistics
   */
  async getUserStats() {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const adminUsers = await User.countDocuments({ role: 'admin' });
      const regularUsers = await User.countDocuments({ role: 'user' });
      const verifiedUsers = await User.countDocuments({ emailVerified: true });

      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        users: regularUsers,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers
      };

      logger.info('User statistics retrieved', stats);

      return stats;
    } catch (error) {
      logger.error('Get user stats service error', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

export default new UserService();