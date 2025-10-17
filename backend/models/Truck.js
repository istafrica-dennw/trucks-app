import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9\-\s]+$/, 'Please enter a valid plate number']
  },
  make: {
    type: String,
    required: [true, 'Truck make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Truck model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  capacity: {
    type: Number,
    required: [true, 'Truck capacity is required'],
    min: [1, 'Capacity must be greater than 0']
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'petrol', 'electric', 'hybrid'],
    default: 'diesel'
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Optional fields
  vin: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  lastServiceDate: Date,
  nextServiceDate: Date,
  insuranceExpiry: Date,
  registrationExpiry: Date
}, {
  timestamps: true
});

// Indexes for better performance
truckSchema.index({ plateNumber: 1 });
truckSchema.index({ status: 1 });
truckSchema.index({ make: 1, model: 1 });
truckSchema.index({ year: 1 });

// Virtual for truck age
truckSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for service status
truckSchema.virtual('serviceStatus').get(function() {
  if (!this.nextServiceDate) return 'unknown';
  
  const today = new Date();
  const daysUntilService = Math.ceil((this.nextServiceDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilService < 0) return 'overdue';
  if (daysUntilService <= 7) return 'due-soon';
  return 'good';
});

// Pre-save middleware to ensure plate number is uppercase
truckSchema.pre('save', function(next) {
  if (this.plateNumber) {
    this.plateNumber = this.plateNumber.toUpperCase().trim();
  }
  next();
});

// Static method to find trucks by status
truckSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Static method to find trucks due for service
truckSchema.statics.findDueForService = function() {
  const today = new Date();
  return this.find({
    nextServiceDate: { $lte: today },
    status: 'active'
  });
};

// Instance method to update service dates
truckSchema.methods.updateServiceDates = function(lastServiceDate, nextServiceDate) {
  this.lastServiceDate = lastServiceDate;
  this.nextServiceDate = nextServiceDate;
  return this.save();
};

// Transform output
truckSchema.methods.toJSON = function() {
  const truckObject = this.toObject();
  truckObject.age = this.age;
  truckObject.serviceStatus = this.serviceStatus;
  return truckObject;
};

export default mongoose.model('Truck', truckSchema);