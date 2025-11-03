import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: [
      'journey_started',
      'journey_completed',
      'payment_received',
      'installment_paid',
      'driver_assigned',
      'truck_added',
      'truck_updated',
      'driver_added',
      'driver_updated',
      'user_created',
      'user_updated',
      'maintenance_completed',
      'system_event'
    ]
  },
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Reference to related entities
  journeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    default: null
  },
  truckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    default: null
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performer is required']
  },
  // Activity metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Activity status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Activity timestamp (when it actually happened)
  activityTimestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1, createdAt: -1 });
activitySchema.index({ journeyId: 1, createdAt: -1 });
activitySchema.index({ truckId: 1, createdAt: -1 });
activitySchema.index({ driverId: 1, createdAt: -1 });
activitySchema.index({ status: 1, createdAt: -1 });
activitySchema.index({ activityTimestamp: -1 });

// Virtual for formatted timestamp
activitySchema.virtual('formattedTimestamp').get(function() {
  const now = new Date();
  const activityTime = this.activityTimestamp || this.createdAt;
  const diffInSeconds = Math.floor((now - activityTime) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return activityTime.toLocaleDateString();
  }
});

// Static method to create activity
activitySchema.statics.createActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    throw new Error(`Failed to create activity: ${error.message}`);
  }
};

// Static method to get recent activities
activitySchema.statics.getRecentActivities = async function(limit = 10, filters = {}) {
  try {
    const query = { status: 'active', ...filters };
    const activities = await this.find(query)
      .populate('performedBy', 'username role')
      .populate('journeyId', 'customer destination status')
      .populate('truckId', 'plateNumber model')
      .populate('driverId', 'name phone')
      .populate('userId', 'username role')
      .sort({ activityTimestamp: -1, createdAt: -1 })
      .limit(limit);
    
    return activities;
  } catch (error) {
    throw new Error(`Failed to get recent activities: ${error.message}`);
  }
};

// Static method to get activities by type
activitySchema.statics.getActivitiesByType = async function(type, limit = 20) {
  try {
    const activities = await this.find({ type, status: 'active' })
      .populate('performedBy', 'username role')
      .populate('journeyId', 'customer destination status')
      .populate('truckId', 'plateNumber model')
      .populate('driverId', 'name phone')
      .populate('userId', 'username role')
      .sort({ activityTimestamp: -1, createdAt: -1 })
      .limit(limit);
    
    return activities;
  } catch (error) {
    throw new Error(`Failed to get activities by type: ${error.message}`);
  }
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
