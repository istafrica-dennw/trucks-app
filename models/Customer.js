import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  }
}, {
  timestamps: true
});

// Indexes for better performance
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ country: 1 });

export default mongoose.model('Customer', customerSchema);

