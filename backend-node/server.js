const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// routes
app.use('/api/auth', require('./src/auth/auth.routes'));
app.use('/api/2fa', require('./src/routes/twoFactor'));
app.use('/api', require('./src/auth/protected.routes'));

// 404 for other /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const msg = err?.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error('[api:error]', msg);
  }
  res.status(500).json({ error: msg });
});

// start
(async () => {
  const PORT = process.env.PORT || 4000;
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.warn('No MONGO_URI provided — starting server without database connection (read-only or limited functionality).');
  } else {
    try {
      await mongoose.connect(MONGO_URI);
      if (process.env.NODE_ENV !== 'production') {
        console.info('[api] connected to MongoDB');
      }
    } catch (e) {
      console.error('Mongo connection error:', e?.message || e);
      console.warn('Continuing without DB connection — some routes may fail.');
    }
  }
  const server = app.listen(PORT, () =>
    console.log(`API running http://localhost:${PORT}`)
  );
  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
