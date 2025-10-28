import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    required: [true, 'Truck is required']
  },
  departureCity: {
    type: String,
    required: [true, 'Departure city is required'],
    trim: true
  },
  destinationCity: {
    type: String,
    required: [true, 'Destination city is required'],
    trim: true
  },
  cargo: {
    type: String,
    required: [true, 'Cargo is required'],
    trim: true
  },
  customer: {
    type: String,
    required: [true, 'Customer is required'],
    trim: true
  },
  expenses: [{
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Expense amount cannot be negative']
    },
    note: {
      type: String,
      trim: true
    }
  }],
  pay: {
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    paidOption: {
      type: String,
      required: [true, 'Payment option is required'],
      enum: ['full', 'installment']
    },
    installments: [{
      amount: {
        type: Number,
        required: true,
        min: [0, 'Installment amount cannot be negative']
      },
      date: {
        type: Date,
        required: true,
        default: Date.now
      },
      note: {
        type: String,
        trim: true
      }
    }]
  },
  balance: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['started', 'completed'],
    default: 'started'
  },
  date: {
    type: Date,
    required: [true, 'Journey date is required'],
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
driveSchema.index({ truck: 1 });
driveSchema.index({ driver: 1 });
driveSchema.index({ date: -1 });
driveSchema.index({ status: 1 });
driveSchema.index({ createdBy: 1 });
driveSchema.index({ customer: 1 });
driveSchema.index({ departureCity: 1 });
driveSchema.index({ destinationCity: 1 });
driveSchema.index({ 'pay.paidOption': 1 });
driveSchema.index({ date: -1, truck: 1 });
driveSchema.index({ date: -1, driver: 1 });

// Virtual for total expenses
driveSchema.virtual('totalExpenses').get(function() {
  if (!this.expenses || this.expenses.length === 0) return 0;
  
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// Virtual for total paid amount
driveSchema.virtual('totalPaid').get(function() {
  if (this.pay.paidOption === 'full') {
    return this.pay.totalAmount;
  }
  
  if (!this.pay.installments || this.pay.installments.length === 0) return 0;
  
  return this.pay.installments.reduce((total, installment) => total + installment.amount, 0);
});

// Virtual for balance (total paid - total expenses)
driveSchema.virtual('calculatedBalance').get(function() {
  const totalPaid = this.totalPaid || 0;
  const totalExpenses = this.totalExpenses || 0;
  return totalPaid - totalExpenses;
});

// Virtual for is fully paid
driveSchema.virtual('isFullyPaid').get(function() {
  const totalPaid = this.totalPaid || 0;
  return totalPaid >= this.pay.totalAmount;
});

// Pre-save middleware to validate payment and calculate balance
driveSchema.pre('save', function(next) {
  // Validate that journey date is not in the future
  if (this.date > new Date()) {
    return next(new Error('Journey date cannot be in the future'));
  }
  
  // Validate installment payments don't exceed total amount
  if (this.pay.paidOption === 'installment') {
    const totalInstallments = this.pay.installments.reduce((total, installment) => total + installment.amount, 0);
    if (totalInstallments > this.pay.totalAmount) {
      return next(new Error('Total installments cannot exceed total amount'));
    }
  }
  
  // Calculate and update balance
  this.balance = this.calculatedBalance;
  
  next();
});

// Static method to find journeys by date range
driveSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('truck driver createdBy');
};

// Static method to find journeys by truck
driveSchema.statics.findByTruck = function(truckId, limit = 50) {
  return this.find({ truck: truckId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('truck driver createdBy');
};

// Static method to find journeys by driver
driveSchema.statics.findByDriver = function(driverId, limit = 50) {
  return this.find({ driver: driverId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('truck driver createdBy');
};

// Static method to find journeys by customer
driveSchema.statics.findByCustomer = function(customer, limit = 50) {
  return this.find({ customer: { $regex: customer, $options: 'i' } })
    .sort({ date: -1 })
    .limit(limit)
    .populate('truck driver createdBy');
};

// Static method to get journey statistics
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
        totalJourneys: { $sum: 1 },
        totalAmount: { $sum: '$pay.totalAmount' },
        totalExpenses: { $sum: { $sum: '$expenses.amount' } },
        totalPaid: { $sum: { $sum: '$pay.installments.amount' } },
        averageAmount: { $avg: '$pay.totalAmount' },
        completedJourneys: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance method to add expense
driveSchema.methods.addExpense = function(expense) {
  this.expenses.push(expense);
  return this.save();
};

// Instance method to add installment
driveSchema.methods.addInstallment = function(installment) {
  if (this.pay.paidOption !== 'installment') {
    throw new Error('Cannot add installment to non-installment payment');
  }
  
  const currentTotal = this.pay.installments.reduce((total, inst) => total + inst.amount, 0);
  if (currentTotal + installment.amount > this.pay.totalAmount) {
    throw new Error('Installment would exceed total amount');
  }
  
  this.pay.installments.push(installment);
  return this.save();
};

// Instance method to complete journey
driveSchema.methods.completeJourney = function() {
  this.status = 'completed';
  return this.save();
};

// Virtual fields are now automatically included via schema options

export default mongoose.model('Drive', driveSchema);