import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  exchangeRates: {
    USD: {
      type: Number,
      default: 1200,
      min: [0.01, 'Exchange rate must be greater than 0']
    },
    RWF: {
      type: Number,
      default: 1,
      min: [0.01, 'Exchange rate must be greater than 0']
    },
    UGX: {
      type: Number,
      default: 3.2,
      min: [0.01, 'Exchange rate must be greater than 0']
    },
    TZX: {
      type: Number,
      default: 0.52,
      min: [0.01, 'Exchange rate must be greater than 0']
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;


