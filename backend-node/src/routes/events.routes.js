const router = require('express').Router();
const Event = require('../models/Event');
const NO_DB_SAVE = String(process.env.NO_DB_SAVE || '').trim().toLowerCase() === 'true';

// Create event (save only, no auto-share)
// POST /api/events
router.post('/events', async (req, res, next) => {
  try {
    const { name, date, venue, price, audience, photoUrl } = req.body || {};
    if (!name || !date || !venue || !price || !audience || !photoUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (NO_DB_SAVE) {
      // echo only; do not persist
      return res.status(201).json({ event: { name, date, venue, price, audience, photoUrl }, saved: false });
    }
    const doc = await Event.create({ name, date, venue, price, audience, photoUrl, status: 'pending' });
    return res.status(201).json({ id: doc._id, event: doc, saved: true });
  } catch (err) {
    return next(err);
  }
});

// List events
// GET /api/events
router.get('/events', async (_req, res, next) => {
  try {
    if (NO_DB_SAVE) {
      return res.json({ items: [], saved: false, note: 'NO_DB_SAVE=true: database is disabled' });
    }
    const items = await Event.find().sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

// Get one event
// GET /api/events/:id
router.get('/events/:id', async (req, res, next) => {
  try {
    if (NO_DB_SAVE) {
      return res.status(404).json({ error: 'not available in NO_DB_SAVE mode' });
    }
    const item = await Event.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'not found' });
    return res.json({ event: item });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
