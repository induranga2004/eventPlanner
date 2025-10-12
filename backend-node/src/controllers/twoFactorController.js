const User = require('../models/User');
const totpService = require('../services/totpService');
const jwt = require('jsonwebtoken');

class TwoFactorController {
  // Setup 2FA - Generate secret and QR code
  async setup2FA(req, res) {
    try {
      console.log('Setup 2FA called, user:', req.user);
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        console.log('User not found:', userId);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      console.log('User found:', user.email);

      if (user.twoFactorEnabled) {
        console.log('2FA already enabled for user:', user.email);
        return res.status(400).json({ 
          success: false, 
          message: '2FA is already enabled for this account' 
        });
      }

      // Generate new secret
      console.log('Generating secret for user:', user.email);
      const secretData = totpService.generateSecret(user.email);
      
      // Encrypt and store the secret temporarily (not enabled yet)
      console.log('Encrypting secret...');
      const encryptedSecret = totpService.encrypt(secretData.secret);
      user.twoFactorSecret = encryptedSecret;
      await user.save();
      console.log('Secret saved to database');

      // Generate QR code
      console.log('Generating QR code URL...');
      // Send the TOTP URL instead of pre-generated QR code
      console.log('QR code URL generated successfully');

      res.json({
        success: true,
        data: {
          qrCode: secretData.otpauthUrl, // Send the URL for frontend to generate QR
          manualEntryKey: secretData.secret,
          backupCodes: null // Will be generated after verification
        }
      });

    } catch (error) {
      console.error('2FA Setup Error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to setup 2FA',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify and enable 2FA
  async enable2FA(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: 'TOTP token is required' 
        });
      }

      const user = await User.findById(userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ 
          success: false, 
          message: 'No 2FA setup found. Please setup 2FA first.' 
        });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({ 
          success: false, 
          message: '2FA is already enabled' 
        });
      }

      // Verify the token
      const isValid = totpService.verifyToken(user.twoFactorSecret, token);
      
      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid TOTP token' 
        });
      }

      // Generate backup codes
      const backupCodes = totpService.generateBackupCodes();
      const hashedBackupCodes = totpService.hashBackupCodes(backupCodes);

      // Enable 2FA
      user.twoFactorEnabled = true;
      user.twoFactorBackupCodes = hashedBackupCodes;
      user.twoFactorSetupDate = new Date();
      user.lastTOTPUsed = new Date();
      user.lastTOTPToken = token; // Store the setup token
      await user.save();

      res.json({
        success: true,
        message: '2FA enabled successfully',
        data: {
          backupCodes // Show these only once
        }
      });

    } catch (error) {
      console.error('2FA Enable Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to enable 2FA' 
      });
    }
  }

  // Verify 2FA token during login
  async verify2FA(req, res) {
    try {
      const { token, email, isBackupCode = false } = req.body;

      if (!token || !email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token and email are required' 
        });
      }

      const user = await User.findOne({ email }).select('+password +twoFactorSecret +twoFactorBackupCodes');
      
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid request' 
        });
      }

      let isValid = false;

      if (isBackupCode) {
        // Verify backup code
        isValid = totpService.verifyBackupCode(token, user.twoFactorBackupCodes);
        
        if (isValid) {
          // Remove used backup code
          const hashedToken = require('crypto').createHash('sha256').update(token.toUpperCase()).digest('hex');
          user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(code => code !== hashedToken);
          await user.save();
        }
      } else {
        // Check for replay attack - specific token-based check
        if (totpService.isSpecificTokenRecentlyUsed(user.lastTOTPToken, user.lastTOTPUsed, token)) {
          return res.status(400).json({ 
            success: false, 
            message: 'This specific token was recently used. Please wait for a new token.' 
          });
        }

        // Verify TOTP token
        isValid = totpService.verifyToken(user.twoFactorSecret, token);
        
        if (isValid) {
          user.lastTOTPUsed = new Date();
          user.lastTOTPToken = token; // Store the used token
          await user.save();
        }
      }

      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: isBackupCode ? 'Invalid backup code' : 'Invalid TOTP token' 
        });
      }

      // Generate JWT token for successful authentication
      const jwtToken = jwt.sign(
        { 
          sub: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: '2FA verification successful',
        data: {
          token: jwtToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            phone: user.phone,
            twoFactorEnabled: user.twoFactorEnabled,
            createdAt: user.createdAt,
            // Include role-specific fields
            spotifyLink: user.spotifyLink,
            venueAddress: user.venueAddress,
            capacity: user.capacity,
            bandName: user.bandName,
            genres: user.genres,
            companyName: user.companyName,
            contactPerson: user.contactPerson,
            address: user.address
          }
        }
      });

    } catch (error) {
      console.error('2FA Verify Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify 2FA' 
      });
    }
  }

  // Disable 2FA
  async disable2FA(req, res) {
    try {
      const { token, password } = req.body;
      const userId = req.user.id;

      if (!token || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'TOTP token and password are required' 
        });
      }

      const user = await User.findById(userId).select('+password +twoFactorSecret');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      if (!user.twoFactorEnabled) {
        return res.status(400).json({ 
          success: false, 
          message: '2FA is not enabled' 
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid password' 
        });
      }

      // Verify TOTP token
      const isTokenValid = totpService.verifyToken(user.twoFactorSecret, token);
      if (!isTokenValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid TOTP token' 
        });
      }

      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.twoFactorBackupCodes = [];
      user.lastTOTPUsed = null;
      user.twoFactorSetupDate = null;
      await user.save();

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });

    } catch (error) {
      console.error('2FA Disable Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to disable 2FA' 
      });
    }
  }

  // Get 2FA status
  async get2FAStatus(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: {
          twoFactorEnabled: user.twoFactorEnabled,
          setupDate: user.twoFactorSetupDate,
          backupCodesCount: user.twoFactorBackupCodes ? user.twoFactorBackupCodes.length : 0
        }
      });

    } catch (error) {
      console.error('2FA Status Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get 2FA status' 
      });
    }
  }

  // Generate new backup codes
  async generateNewBackupCodes(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: 'TOTP token is required' 
        });
      }

      const user = await User.findById(userId).select('+twoFactorSecret');
      
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ 
          success: false, 
          message: '2FA is not enabled' 
        });
      }

      // Verify TOTP token
      const isTokenValid = totpService.verifyToken(user.twoFactorSecret, token);
      if (!isTokenValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid TOTP token' 
        });
      }

      // Generate new backup codes
      const backupCodes = totpService.generateBackupCodes();
      const hashedBackupCodes = totpService.hashBackupCodes(backupCodes);

      user.twoFactorBackupCodes = hashedBackupCodes;
      await user.save();

      res.json({
        success: true,
        message: 'New backup codes generated',
        data: {
          backupCodes
        }
      });

    } catch (error) {
      console.error('Generate Backup Codes Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate backup codes' 
      });
    }
  }
}

module.exports = new TwoFactorController();