import userService from '../services/userService.js';
import logger from '../utils/logger.js';

class UserController {
  /**
   * Get all users with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        isActive,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        isActive: isActive !== undefined ? isActive === 'true' : null,
        search
      };

      const result = await userService.getAllUsers(options);

      logger.info('Users retrieved via API', {
        count: result.users.length,
        total: result.pagination.total,
        page: options.page,
        limit: options.limit,
        requestedBy: req.user?.id
      });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Get all users controller error', {
        error: error.message,
        query: req.query,
        requestedBy: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  }

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      logger.info('User retrieved by ID via API', {
        userId: user._id,
        requestedBy: req.user?.id
      });

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user by ID controller error', {
        error: error.message,
        userId: req.params.id,
        requestedBy: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve user'
      });
    }
  }

  /**
   * Create new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      const { username, password } = req.body;

      const userData = {
        username,
        password,
        role: 'user' // Always default to 'user' role
      };

      const user = await userService.createUser(userData);

      logger.info('User created via API', {
        userId: user._id,
        username: user.username,
        role: user.role,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      logger.error('Create user controller error', {
        error: error.message,
        body: { ...req.body, password: '[HIDDEN]' },
        createdBy: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  }

  /**
   * Update user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, role, isActive } = req.body;

      const updateData = {
        username,
        role,
        isActive
      };

      const user = await userService.updateUser(id, updateData);

      logger.info('User updated via API', {
        userId: user._id,
        username: user.username,
        updatedFields: Object.keys(updateData).filter(key => updateData[key] !== undefined),
        updatedBy: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update user controller error', {
        error: error.message,
        userId: req.params.id,
        body: req.body,
        updatedBy: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message === 'User not found' ? 404 : 
                        error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  }

  /**
   * Delete user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const result = await userService.deleteUser(id);

      logger.info('User deleted via API', {
        deletedUserId: id,
        deletedBy: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.deletedUser
      });
    } catch (error) {
      logger.error('Delete user controller error', {
        error: error.message,
        userId: req.params.id,
        deletedBy: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message === 'User not found' ? 404 : 
                        error.message.includes('Cannot delete') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();

      logger.info('User statistics retrieved via API', {
        requestedBy: req.user?.id
      });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get user stats controller error', {
        error: error.message,
        requestedBy: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics'
      });
    }
  }
}

export default new UserController();