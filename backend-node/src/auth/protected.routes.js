const router = require('express').Router();
const requireAuth = require('./middleware/requireAuth');
const User = require('../models/User');
// Background removal feature disabled: noop import for compatibility
const { removeBackground } = require('../utils/removeBackground');
const fs = require('fs');
const path = require('path');

// GET /api/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    // Background removal disabled: ensure bgRemoved fields fall back to original paths
    let updated = false;
    if (user.photo && !user.photoBgRemoved) {
      user.photoBgRemoved = user.photo;
      updated = true;
    }
    if (user.additionalPhoto && !user.additionalPhotoBgRemoved) {
      user.additionalPhotoBgRemoved = user.additionalPhoto;
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

    // Background removal was removed; simply echo back the existing paths
    user.additionalPhotoBgRemoved = user.additionalPhoto;
    await user.save();

    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.json({ user: safeUser, message: 'Background removal feature disabled' });
  } catch (error) {
    res.status(500).json({ error: 'failed to reprocess additional photo' });
  }
});

// POST /api/reprocess/photos - process both main and additional photos
router.post('/reprocess/photos', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    // Background removal disabled: set bgRemoved fields to original paths if missing
    if (user.photo && !user.photoBgRemoved) user.photoBgRemoved = user.photo;
    if (user.additionalPhoto && !user.additionalPhotoBgRemoved) user.additionalPhotoBgRemoved = user.additionalPhoto;

    await user.save();
    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.json({ user: safeUser, message: 'Background removal feature disabled' });
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
