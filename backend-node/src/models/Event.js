const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true }, // ISO date string (YYYY-MM-DD)
  venue: { type: String, required: true },
  price: { type: String, required: true },
  audience: { type: String, required: true },
  photoUrl: { type: String, required: true },
  caption: { type: String },
  postResult: { type: Object },
  status: { type: String, enum: ['pending', 'posted', 'failed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
