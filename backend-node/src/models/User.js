const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'musician', 'venue'], required: true },
  name: { type: String, required: true },
  phone: { type: String },
  // Additional fields for musicians
  photo: { type: String },
  spotifyLink: { type: String },
  additionalPhoto: { type: String },
  // Additional fields for venues
  venueAddress: { type: String },
  capacity: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
