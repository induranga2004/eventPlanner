const router = require('express').Router();
const requireAuth = require('./middleware/requireAuth');
const User = require('../models/User');
const { removeBackground } = require('../utils/removeBackground');
const fs = require('fs');
const path = require('path');

// GET /api/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    // Lazy backfill: if bg-removed images are missing but originals exist, generate them now
    let updated = false;
    if (user.photo && !user.photoBgRemoved) {
      user.photoBgRemoved = await removeBackground(user.photo);
      updated = true;
    }
    if (user.additionalPhoto && !user.additionalPhotoBgRemoved) {
      user.additionalPhotoBgRemoved = await removeBackground(user.additionalPhoto);
      updated = true;
    }
    if (updated) await user.save();

    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'failed to fetch user details' });
  }
});

// POST /api/reprocess/additional-photo - regenerate background-removed image for additional photo
router.post('/reprocess/additional-photo', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    if (!user.additionalPhoto) {
      return res.status(400).json({ error: 'no additionalPhoto to process' });
    }

    const processedPath = await removeBackground(user.additionalPhoto);
    user.additionalPhotoBgRemoved = processedPath;
    await user.save();

    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'failed to reprocess additional photo' });
  }
});

// POST /api/reprocess/photos - process both main and additional photos
router.post('/reprocess/photos', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    if (user.photo) {
      user.photoBgRemoved = await removeBackground(user.photo);
    }
    if (user.additionalPhoto) {
      user.additionalPhotoBgRemoved = await removeBackground(user.additionalPhoto);
    }

    await user.save();
    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'failed to reprocess photos' });
  }
});

module.exports = router;

// GET /api/debug/images - check existence of user images on disk
router.get('/debug/images', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'user not found' });

    const toFs = (webPath) =>
      webPath ? path.join(__dirname, '../../uploads', path.basename(webPath)) : null;

    const files = {
      photo: user.photo || null,
      photoBgRemoved: user.photoBgRemoved || null,
      additionalPhoto: user.additionalPhoto || null,
      additionalPhotoBgRemoved: user.additionalPhotoBgRemoved || null,
    };

    const checks = Object.fromEntries(
      Object.entries(files).map(([k, v]) => [
        k,
        v
          ? { webPath: v, fsPath: toFs(v), exists: fs.existsSync(toFs(v)), size: (() => {
              try { return fs.statSync(toFs(v)).size; } catch { return null; }
            })() }
          : null,
      ])
    );

    return res.json({ userId: user._id, files: checks });
  } catch (error) {
    return res.status(500).json({ error: 'debug check failed' });
  }
});
