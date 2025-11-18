import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validation.js';
import {
  customerId,
  getAllCustomers,
  createCustomer,
  updateCustomer
} from '../validators/customerValidators.js';
import {
  getAllCustomersController,
  getCustomerByIdController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
  getCustomerStatsController
} from '../controllers/customerController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/customers - List all customers with pagination and filtering
router.get('/', 
  validateQuery(getAllCustomers),
  getAllCustomersController
);

// GET /api/customers/stats - Get customer statistics for dashboard
router.get('/stats', getCustomerStatsController);

// POST /api/customers - Create new customer (admin/officer only)
router.post('/', 
  authorize('admin', 'officer'),
  validate(createCustomer),
  createCustomerController
);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', 
  validateParams(customerId),
  getCustomerByIdController
);

// PUT /api/customers/:id - Update customer (admin/officer only)
router.put('/:id', 
  authorize('admin', 'officer'),
  validateParams(customerId),
  validate(updateCustomer),
  updateCustomerController
);

// DELETE /api/customers/:id - Delete customer (admin/officer only)
router.delete('/:id', 
  authorize('admin', 'officer'),
  validateParams(customerId),
  deleteCustomerController
);

export default router;

