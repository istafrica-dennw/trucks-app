import express from 'express';
import jwt from 'jsonwebtoken';
import { protect, authorize } from '../middleware/auth.js';
import userService from '../services/userService.js';
import truckService from '../services/truckService.js';
import * as driverService from '../services/driverService.js';
import * as driveService from '../services/driveService.js';
import authService from '../services/authService.js';

const router = express.Router();

// Home redirect
router.get('/', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect('/login');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getUserById(decoded.id);
      
      if (!user || !user.isActive) {
        return res.redirect('/login');
      }

      // Redirect based on role
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/dashboard');
      }
    } catch (error) {
      return res.redirect('/login');
    }
  } catch (error) {
    return res.redirect('/login');
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login',
    error: req.query.error || null,
    login: req.query.login || ''
  });
});

// Login form submission
router.post('/login', async (req, res) => {
  try {
    const { login, password, rememberMe } = req.body;
    
    // Use existing auth service
    const result = await authService.login(login, password);
    
    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
    };
    
    res.cookie('token', result.token, cookieOptions);

    // Redirect based on role
    if (result.user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    res.render('login', {
      title: 'Login',
      error: error.message || 'Invalid credentials',
      login: req.body.login || ''
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Admin Dashboard
router.get('/admin/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get dashboard stats
    const userStats = await userService.getUserStats();
    const truckStats = await truckService.getTruckStats();
    const driverStats = await driverService.getDriverStats();
    
    const stats = {
      users: userStats,
      trucks: truckStats,
      drivers: driverStats
    };
    
    res.render('admin-dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load dashboard'
    });
  }
});

// User Dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get user-specific stats
    const userStats = await userService.getUserStats();
    const truckStats = await truckService.getTruckStats();
    const driverStats = await driverService.getDriverStats();
    
    const stats = {
      users: userStats,
      trucks: truckStats,
      drivers: driverStats
    };
    
    res.render('user-dashboard', {
      title: 'Dashboard',
      user: req.user,
      stats: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load dashboard'
    });
  }
});

// Users page
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const response = await userService.getAllUsers();
    
    res.render('users', {
      title: 'Users',
      user: req.user,
      users: response.users.map(user => user.toObject()),
      pagination: response.pagination
    });
  } catch (error) {
    res.render('error', {
      title: 'Error',
      message: 'Failed to load users'
    });
  }
});

// Trucks page
router.get('/admin/trucks', protect, authorize('admin'), async (req, res) => {
  try {
    const response = await truckService.getAllTrucks();
    
    res.render('trucks', {
      title: 'Trucks',
      user: req.user,
      trucks: response.trucks.map(truck => truck.toObject()),
      pagination: response.pagination
    });
  } catch (error) {
    res.render('error', {
      title: 'Error',
      message: 'Failed to load trucks'
    });
  }
});

// Drivers page
router.get('/admin/drivers', protect, authorize('admin'), async (req, res) => {
  try {
    const response = await driverService.getAllDrivers();
    
    res.render('drivers', {
      title: 'Drivers',
      user: req.user,
      drivers: response.drivers.map(driver => driver.toObject()),
      pagination: response.pagination
    });
  } catch (error) {
    res.render('error', {
      title: 'Error',
      message: 'Failed to load drivers'
    });
  }
});

// Journeys page
router.get('/admin/journeys', protect, authorize('admin'), async (req, res) => {
  try {
    const response = await driveService.getAllDrives();
    
    res.render('journeys', {
      title: 'Journeys',
      user: req.user,
      journeys: response.drives.map(journey => journey.toObject()),
      pagination: response.pagination
    });
  } catch (error) {
    res.render('error', {
      title: 'Error',
      message: 'Failed to load journeys'
    });
  }
});

// Reports page
router.get('/admin/reports', protect, authorize('admin'), (req, res) => {
  res.render('reports', {
    title: 'Reports',
    user: req.user
  });
});

// Profile page
router.get('/profile', protect, (req, res) => {
  res.render('profile', {
    title: 'Profile',
    user: req.user
  });
});

export default router;