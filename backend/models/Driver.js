import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    sparse: true // Allow null values but ensure uniqueness when present
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Optional fields
  photo: {
    type: String, // URL to photo
    trim: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  medicalCertificateExpiry: Date,
  trainingCertificates: [{
    name: String,
    expiryDate: Date,
    issuedBy: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
driverSchema.index({ phone: 1 });
driverSchema.index({ email: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ lastName: 1, firstName: 1 });

// Virtual for full name
driverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for license status
driverSchema.virtual('licenseStatus').get(function() {
  if (!this.licenseExpiry) return 'unknown';
  
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.licenseExpiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  return 'valid';
});

// Virtual for age
driverSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Pre-save middleware to ensure license number is uppercase
driverSchema.pre('save', function(next) {
  if (this.licenseNumber) {
    this.licenseNumber = this.licenseNumber.toUpperCase().trim();
  }
  next();
});

// Static method to find drivers by status
driverSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Static method to find drivers with expiring licenses
driverSchema.statics.findWithExpiringLicenses = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    licenseExpiry: { $lte: futureDate },
    status: 'active'
  });
};

// Instance method to update license
driverSchema.methods.updateLicense = function(licenseNumber, expiryDate) {
  this.licenseNumber = licenseNumber;
  this.licenseExpiry = expiryDate;
  return this.save();
};

// Instance method to add training certificate
driverSchema.methods.addTrainingCertificate = function(certificate) {
  this.trainingCertificates.push(certificate);
  return this.save();
};

// Transform output
driverSchema.methods.toJSON = function() {
  const driverObject = this.toObject();
  driverObject.fullName = this.fullName;
  driverObject.licenseStatus = this.licenseStatus;
  driverObject.age = this.age;
  return driverObject;
};

export default mongoose.model('Driver', driverSchema);