const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'musician', 'music_band', 'venue', 'lights', 'sounds'], required: true },
  name: { type: String, required: true },
  phone: { type: String },
  standardRate: { type: Number },
  
  // Two-Factor Authentication fields
  twoFactorSecret: { type: String }, // Encrypted TOTP secret
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorBackupCodes: [{ type: String }], // Hashed backup codes
  lastTOTPUsed: { type: Date }, // Prevent replay attacks
  lastTOTPToken: { type: String }, // Store last used token for replay prevention
  twoFactorSetupDate: { type: Date },
  
  // Subscription and Pro features
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  subscriptionExpiry: { type: Date },
  proFeatures: {
    unlimitedEvents: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false }
  },
  // Payment related
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  paymentHistory: [{
    amount: { type: Number },
    currency: { type: String, default: 'usd' },
    date: { type: Date, default: Date.now },
    status: { type: String },
    invoiceId: { type: String }
  }],
  
  // Additional fields for musicians
  photo: { type: String },
  spotifyLink: { type: String },
  additionalPhoto: { type: String },
  // Additional fields for venues
  venueAddress: { type: String },
  capacity: { type: Number },
  // Additional fields for music bands
  bandName: { type: String },
  genres: { type: String },
  members: { type: Number },
  experience: { type: Number },
  equipment: { type: String },
  bio: { type: String },
  youtubeLink: { type: String },
  instagramLink: { type: String },
  facebookLink: { type: String },
  logo: { type: String },
  // Additional fields for lights and sounds services
  companyName: { type: String },
  contactPerson: { type: String },
  address: { type: String },
  lightTypes: { type: String },
  eventTypes: { type: String },
  services: { type: String },
  crewSize: { type: Number },
  equipmentDetails: { type: String },
  website: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
