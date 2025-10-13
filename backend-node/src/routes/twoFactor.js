const router = require('express').Router();
const twoFactorController = require('../controllers/twoFactorController');
const requireAuth = require('../auth/middleware/requireAuth');

// Setup 2FA - Generate QR code and secret
router.post('/setup', requireAuth, twoFactorController.setup2FA);

// Enable 2FA after verification
router.post('/enable', requireAuth, twoFactorController.enable2FA);

// Verify 2FA token during login
router.post('/verify', twoFactorController.verify2FA);

// Disable 2FA
router.post('/disable', requireAuth, twoFactorController.disable2FA);

// Get 2FA status
router.get('/status', requireAuth, twoFactorController.get2FAStatus);

// Generate new backup codes
router.post('/backup-codes', requireAuth, twoFactorController.generateNewBackupCodes);

module.exports = router;