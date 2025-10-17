import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema({
  truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    required: [true, 'Truck is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  date: {
    type: Date,
    required: [true, 'Drive date is required'],
    default: Date.now
  },
  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true
  },
  endLocation: {
    type: String,
    required: [true, 'End location is required'],
    trim: true
  },
  customer: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['started', 'completed'],
    default: 'started'
  },
  // Financial information
  revenue: {
    type: Number,
    min: [0, 'Revenue cannot be negative']
  },
  expenses: [{
    type: {
      type: String,
      required: true,
      enum: ['fuel', 'toll', 'maintenance', 'other']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Expense amount cannot be negative']
    },
    description: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // Optional operational data
  distance: {
    type: Number,
    min: [0, 'Distance cannot be negative']
  },
  fuelConsumption: {
    type: Number,
    min: [0, 'Fuel consumption cannot be negative']
  },
  loadWeight: {
    type: Number,
    min: [0, 'Load weight cannot be negative']
  },
  // Time tracking
  startTime: Date,
  endTime: Date,
  // Created by user
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
driveSchema.index({ truck: 1 });
driveSchema.index({ driver: 1 });
driveSchema.index({ date: -1 });
driveSchema.index({ status: 1 });
driveSchema.index({ createdBy: 1 });
driveSchema.index({ date: -1, truck: 1 });
driveSchema.index({ date: -1, driver: 1 });

// Virtual for duration
driveSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const duration = this.endTime - this.startTime;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});

// Virtual for total expenses
driveSchema.virtual('totalExpenses').get(function() {
  if (!this.expenses || this.expenses.length === 0) return 0;
  
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// Virtual for net profit
driveSchema.virtual('netProfit').get(function() {
  const revenue = this.revenue || 0;
  const expenses = this.totalExpenses || 0;
  return revenue - expenses;
});

// Virtual for fuel efficiency
driveSchema.virtual('fuelEfficiency').get(function() {
  if (!this.distance || !this.fuelConsumption || this.fuelConsumption === 0) return null;
  
  return (this.distance / this.fuelConsumption).toFixed(2);
});

// Pre-save middleware to validate dates
driveSchema.pre('save', function(next) {
  // Validate that end time is after start time
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate that drive date is not in the future
  if (this.date > new Date()) {
    return next(new Error('Drive date cannot be in the future'));
  }
  
  next();
});

// Static method to find drives by date range
driveSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('truck driver createdBy');
};

// Static method to find drives by truck
driveSchema.statics.findByTruck = function(truckId, limit = 50) {
  return this.find({ truck: truckId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('truck driver createdBy');
};

// Static method to find drives by driver
driveSchema.statics.findByDriver = function(driverId, limit = 50) {
  return this.find({ driver: driverId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('truck driver createdBy');
};

// Static method to get drive statistics
driveSchema.statics.getStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDrives: { $sum: 1 },
        totalRevenue: { $sum: '$revenue' },
        totalExpenses: { $sum: { $sum: '$expenses.amount' } },
        totalDistance: { $sum: '$distance' },
        totalFuelConsumption: { $sum: '$fuelConsumption' },
        averageRevenue: { $avg: '$revenue' },
        averageDistance: { $avg: '$distance' }
      }
    }
  ]);
};

// Instance method to add expense
driveSchema.methods.addExpense = function(expense) {
  this.expenses.push(expense);
  return this.save();
};

// Instance method to complete drive
driveSchema.methods.completeDrive = function(endTime) {
  this.status = 'completed';
  this.endTime = endTime || new Date();
  return this.save();
};

// Transform output
driveSchema.methods.toJSON = function() {
  const driveObject = this.toObject();
  driveObject.duration = this.duration;
  driveObject.totalExpenses = this.totalExpenses;
  driveObject.netProfit = this.netProfit;
  driveObject.fuelEfficiency = this.fuelEfficiency;
  return driveObject;
};

export default mongoose.model('Drive', driveSchema);