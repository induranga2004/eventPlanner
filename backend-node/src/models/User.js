const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'musician', 'music_band', 'venue', 'lights', 'sounds'], required: true },
  name: { type: String, required: true },
  phone: { type: String },
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
