const express = require('express');
const axios = require('axios');
const Event = require('../models/Event');

const router = express.Router();

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || 'http://127.0.0.1:8000';
const NO_DB_SAVE = String(process.env.NO_DB_SAVE || '').trim().toLowerCase() === 'true';

router.post('/auto-share', async (req, res, next) => {
  const { name, date, venue, price, audience, photoUrl } = req.body || {};
  if (!name || !date || !venue || !price || !audience || !photoUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let eventDoc = null;
  if (!NO_DB_SAVE) {
    try {
      eventDoc = await Event.create({ name, date, venue, price, audience, photoUrl, status: 'pending' });
    } catch (e) {
      return next(e);
    }
  }

  try {
    // call Python service
    const { data } = await axios.post(`${PY_SERVICE_URL}/auto-share`, {
      name, date, venue, price, audience, photo_url: photoUrl
    }, { timeout: 60000 });

    const caption = data?.caption;
    const postResult = data?.post_result || data?.postResult || data?.result;

    if (!NO_DB_SAVE && eventDoc) {
      eventDoc.caption = caption;
      eventDoc.postResult = postResult;
      eventDoc.status = 'posted';
      await eventDoc.save();
      return res.json({ id: eventDoc._id, caption, postResult });
    }
    // no-db mode: just echo back
    return res.json({ caption, postResult, saved: false });
  } catch (err) {
    try {
      if (!NO_DB_SAVE && eventDoc) {
        eventDoc.status = 'failed';
        await eventDoc.save();
      }
    } catch (_) {}

    // If the Python service responded with an error, bubble up its status and body
    if (err?.response) {
      const status = err.response.status || 500;
      const data = err.response.data;
      const message = (data && (data.error || data.detail)) || err.message || 'Upstream service error';
      return res.status(status).json({ error: message, upstream: data });
    }
    // Network or unexpected error
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

module.exports = router;
