const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30m' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  const token = signToken(user);
  res.status(201).json({ token });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const token = signToken(user);
  res.json({ token });
});

module.exports = router;
