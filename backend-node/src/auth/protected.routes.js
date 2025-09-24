const router = require('express').Router();
const requireAuth = require('./middleware/requireAuth');

// GET /api/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email } });
});

module.exports = router;
