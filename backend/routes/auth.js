import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import authValidators from '../validators/authValidators.js';

const router = express.Router();

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateBody(authValidators.login), authController.login.bind(authController));

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, authController.getProfile.bind(authController));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, validateBody(authValidators.updateProfile), authController.updateProfile.bind(authController));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, authController.logout.bind(authController));

export default router;