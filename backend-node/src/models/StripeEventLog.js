const mongoose = require('mongoose');

const stripeEventLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
    metadata: { type: Object },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('StripeEventLog', stripeEventLogSchema);
