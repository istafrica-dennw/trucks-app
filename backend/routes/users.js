import express from 'express';
import userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import userValidators from '../validators/userValidators.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', validateQuery(userValidators.getAllUsers), userController.getAllUsers.bind(userController));

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
router.get('/stats', userController.getUserStats.bind(userController));

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
router.get('/:id', validateParams(userValidators.userId), userController.getUserById.bind(userController));

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/', validateBody(userValidators.createUser), userController.createUser.bind(userController));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id', validateParams(userValidators.userId), validateBody(userValidators.updateUser), userController.updateUser.bind(userController));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', validateParams(userValidators.userId), userController.deleteUser.bind(userController));

export default router;