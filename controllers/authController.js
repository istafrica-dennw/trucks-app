import authService from '../services/authService.js';
import logger from '../utils/logger.js';

class AuthController {
  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { login, password } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;

      // Call service
      const result = await authService.login(login, password);

      // Update IP in logs (since service doesn't have access to req)
      logger.auth('User login successful', {
        userId: result.user.id,
        username: result.user.username,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        ip: clientIp
      });

      res.status(200).json({
        success: true,
        token: result.token,
        user: result.user
      });
    } catch (error) {
      logger.error('Login controller error', {
        error: error.message,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress,
        stack: error.stack
      });

      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const clientIp = req.ip || req.connection.remoteAddress;

      // Call service
      const userProfile = await authService.getUserProfile(userId);

      // Update IP in logs
      logger.auth('User profile accessed', {
        userId: userProfile.id,
        username: userProfile.username,
        role: userProfile.role,
        ip: clientIp
      });

      res.status(200).json({
        success: true,
        user: userProfile
      });
    } catch (error) {
      logger.error('Get profile controller error', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip || req.connection.remoteAddress,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user profile'
      });
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { email, phone } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;

      // Call service
      const updatedUser = await authService.updateUserProfile(userId, { email, phone });

      // Update IP in logs
      logger.auth('User profile updated', {
        userId: updatedUser.id,
        username: updatedUser.username,
        updatedFields: Object.keys({ email, phone }).filter(key => req.body[key]),
        ip: clientIp
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      logger.error('Update profile controller error', {
        error: error.message,
        userId: req.user?.id,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress,
        stack: error.stack
      });

      const statusCode = error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      const userId = req.user.id;
      const clientIp = req.ip || req.connection.remoteAddress;

      // Call service
      const result = await authService.logout(userId);

      // Update IP in logs
      logger.auth('User logout', {
        userId: userId,
        ip: clientIp
      });

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Logout controller error', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip || req.connection.remoteAddress,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed'
      });
    }
  }
}

export default new AuthController();