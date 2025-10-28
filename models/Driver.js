import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    sparse: true // Allow null values but ensure uniqueness when present
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better performance (phone, email, licenseNumber, nationalId already have unique indexes)
driverSchema.index({ status: 1 });
driverSchema.index({ fullName: 1 });

// Pre-save middleware to ensure license number and national ID are uppercase
driverSchema.pre('save', function(next) {
  if (this.licenseNumber) {
    this.licenseNumber = this.licenseNumber.toUpperCase().trim();
  }
  if (this.nationalId) {
    this.nationalId = this.nationalId.toUpperCase().trim();
  }
  next();
});

// Static method to find drivers by status
driverSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

export default mongoose.model('Driver', driverSchema);