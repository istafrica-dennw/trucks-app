import Activity from '../models/Activity.js';
import logger from '../utils/logger.js';

// Activity creation helpers
export const createJourneyActivity = async (journey, performedBy, action = 'started') => {
  try {
    const activityData = {
      type: action === 'started' ? 'journey_started' : 'journey_completed',
      title: `Journey ${action}`,
      description: `Journey to ${journey.destination} ${action} by ${journey.driver?.name || 'Unknown Driver'}`,
      details: {
        customer: journey.customer,
        destination: journey.destination,
        origin: journey.origin,
        status: journey.status,
        totalAmount: journey.pay?.totalAmount || 0
      },
      journeyId: journey._id,
      truckId: journey.truck,
      driverId: journey.driver,
      performedBy: performedBy._id,
      metadata: {
        action,
        journeyStatus: journey.status
      }
    };

    const activity = await Activity.createActivity(activityData);
    logger.business(`Journey activity created: ${action}`, {
      journeyId: journey._id,
      performedBy: performedBy._id,
      activityId: activity._id
    });
    
    return activity;
  } catch (error) {
    logger.error('Failed to create journey activity', { error: error.message, journeyId: journey._id });
    throw error;
  }
};

export const createPaymentActivity = async (journey, paymentData, performedBy, paymentType = 'payment_received') => {
  try {
    const activityData = {
      type: paymentType,
      title: paymentType === 'payment_received' ? 'Payment Received' : 'Installment Paid',
      description: `${paymentType === 'payment_received' ? 'Full payment' : 'Installment'} of $${paymentData.amount} received for journey to ${journey.destination}`,
      details: {
        amount: paymentData.amount,
        paymentMethod: paymentData.method || 'cash',
        journeyDestination: journey.destination,
        customer: journey.customer,
        remainingBalance: paymentData.remainingBalance || 0
      },
      journeyId: journey._id,
      truckId: journey.truck,
      driverId: journey.driver,
      performedBy: performedBy._id,
      metadata: {
        paymentType,
        amount: paymentData.amount,
        installmentNumber: paymentData.installmentNumber || null
      }
    };

    const activity = await Activity.createActivity(activityData);
    logger.business(`Payment activity created: ${paymentType}`, {
      journeyId: journey._id,
      amount: paymentData.amount,
      performedBy: performedBy._id,
      activityId: activity._id
    });
    
    return activity;
  } catch (error) {
    logger.error('Failed to create payment activity', { error: error.message, journeyId: journey._id });
    throw error;
  }
};

export const createTruckActivity = async (truck, performedBy, action = 'added') => {
  try {
    const activityData = {
      type: action === 'added' ? 'truck_added' : 'truck_updated',
      title: `Truck ${action}`,
      description: `Truck ${truck.plateNumber} (${truck.model}) ${action} to the fleet`,
      details: {
        plateNumber: truck.plateNumber,
        model: truck.model,
        year: truck.year,
        status: truck.status,
        capacity: truck.capacity
      },
      truckId: truck._id,
      performedBy: performedBy._id,
      metadata: {
        action,
        truckStatus: truck.status
      }
    };

    const activity = await Activity.createActivity(activityData);
    logger.business(`Truck activity created: ${action}`, {
      truckId: truck._id,
      performedBy: performedBy._id,
      activityId: activity._id
    });
    
    return activity;
  } catch (error) {
    logger.error('Failed to create truck activity', { error: error.message, truckId: truck._id });
    throw error;
  }
};

export const createDriverActivity = async (driver, performedBy, action = 'added') => {
  try {
    const activityData = {
      type: action === 'added' ? 'driver_added' : 'driver_updated',
      title: `Driver ${action}`,
      description: `Driver ${driver.name} ${action} to the system`,
      details: {
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        status: driver.status,
        experience: driver.experience
      },
      driverId: driver._id,
      performedBy: performedBy._id,
      metadata: {
        action,
        driverStatus: driver.status
      }
    };

    const activity = await Activity.createActivity(activityData);
    logger.business(`Driver activity created: ${action}`, {
      driverId: driver._id,
      performedBy: performedBy._id,
      activityId: activity._id
    });
    
    return activity;
  } catch (error) {
    logger.error('Failed to create driver activity', { error: error.message, driverId: driver._id });
    throw error;
  }
};

export const createUserActivity = async (user, performedBy, action = 'created') => {
  try {
    const activityData = {
      type: action === 'created' ? 'user_created' : 'user_updated',
      title: `User ${action}`,
      description: `User ${user.username} ${action} in the system`,
      details: {
        username: user.username,
        role: user.role,
        isActive: user.isActive
      },
      userId: user._id,
      performedBy: performedBy._id,
      metadata: {
        action,
        userRole: user.role
      }
    };

    const activity = await Activity.createActivity(activityData);
    logger.business(`User activity created: ${action}`, {
      userId: user._id,
      performedBy: performedBy._id,
      activityId: activity._id
    });
    
    return activity;
  } catch (error) {
    logger.error('Failed to create user activity', { error: error.message, userId: user._id });
    throw error;
  }
};

export const createDriverAssignmentActivity = async (journey, driver, performedBy) => {
  try {
    const activityData = {
      type: 'driver_assigned',
      title: 'Driver Assigned',
      description: `Driver ${driver.name} assigned to journey to ${journey.destination}`,
      details: {
        driverName: driver.name,
        driverPhone: driver.phone,
        journeyDestination: journey.destination,
        customer: journey.customer
      },
      journeyId: journey._id,
      truckId: journey.truck,
      driverId: driver._id,
      performedBy: performedBy._id,
      metadata: {
        assignmentType: 'journey',
        driverExperience: driver.experience
      }
    };

    const activity = await Activity.createActivity(activityData);
    logger.business('Driver assignment activity created', {
      journeyId: journey._id,
      driverId: driver._id,
      performedBy: performedBy._id,
      activityId: activity._id
    });
    
    return activity;
  } catch (error) {
    logger.error('Failed to create driver assignment activity', { error: error.message, journeyId: journey._id });
    throw error;
  }
};

// Get activities
export const getRecentActivities = async (limit = 10, filters = {}) => {
  try {
    const activities = await Activity.getRecentActivities(limit, filters);
    return activities;
  } catch (error) {
    logger.error('Failed to get recent activities', { error: error.message });
    throw error;
  }
};

export const getActivitiesByType = async (type, limit = 20) => {
  try {
    const activities = await Activity.getActivitiesByType(type, limit);
    return activities;
  } catch (error) {
    logger.error('Failed to get activities by type', { error: error.message, type });
    throw error;
  }
};

export const getActivityStats = async () => {
  try {
    const stats = await Activity.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latest: { $max: '$createdAt' }
        }
      },
      { $sort: { latest: -1 } }
    ]);

    const totalActivities = await Activity.countDocuments({ status: 'active' });
    const todayActivities = await Activity.countDocuments({
      status: 'active',
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    return {
      totalActivities,
      todayActivities,
      byType: stats
    };
  } catch (error) {
    logger.error('Failed to get activity stats', { error: error.message });
    throw error;
  }
};

