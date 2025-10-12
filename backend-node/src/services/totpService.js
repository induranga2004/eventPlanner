const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class TOTPService {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.secretKey = process.env.TOTP_SECRET_KEY || 'fallback-secret-key';
  }

  // Generate a new TOTP secret for a user
  generateSecret(userEmail) {
    try {
      console.log('Generating secret for:', userEmail);
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: process.env.TOTP_ISSUER || 'EventPlanner',
        length: 32
      });

      console.log('Secret generated successfully');
      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        manualEntryKey: secret.base32
      };
    } catch (error) {
      console.error('Error generating secret:', error);
      throw error;
    }
  }

  // Generate QR code for the secret
  async generateQRCode(otpauthUrl) {
    try {
      console.log('Generating QR code for URL:', otpauthUrl);
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR code generated successfully');
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  verifyToken(secret, token, window = 1) {
    try {
      const decryptedSecret = this.decrypt(secret);
      
      return speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token: token,
        window: window, // Allow 1 step before/after for clock skew
        step: 30 // 30-second time step
      });
    } catch (error) {
      return false;
    }
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Hash backup codes for storage
  hashBackupCodes(codes) {
    return codes.map(code => crypto.createHash('sha256').update(code).digest('hex'));
  }

  // Verify backup code
  verifyBackupCode(plainCode, hashedCodes) {
    const hashedInput = crypto.createHash('sha256').update(plainCode.toUpperCase()).digest('hex');
    return hashedCodes.includes(hashedInput);
  }

  // Encrypt secret for database storage
  encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt secret from database
  decrypt(encryptedData) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.secretKey, 'salt', 32);
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt secret');
    }
  }

  // Get current TOTP token (for testing)
  getCurrentToken(secret) {
    try {
      const decryptedSecret = this.decrypt(secret);
      return speakeasy.totp({
        secret: decryptedSecret,
        encoding: 'base32',
        step: 30
      });
    } catch (error) {
      return null;
    }
  }

  // Check if the specific token was recently used (prevent replay attacks)
  isSpecificTokenRecentlyUsed(lastUsedToken, lastUsedTime, currentToken, windowSeconds = 90) {
    if (!lastUsedToken || !lastUsedTime) return false;
    
    // If it's the exact same token, check if it was used recently
    if (lastUsedToken === currentToken) {
      const now = new Date();
      const diffSeconds = (now - lastUsedTime) / 1000;
      return diffSeconds < windowSeconds; // Block same token for 90 seconds
    }
    
    return false; // Different token, allow it
  }

  // Legacy method for backward compatibility - now with more reasonable timing
  isTokenRecentlyUsed(lastUsed, windowMinutes = 0.5) { // Reduced to 30 seconds
    if (!lastUsed) return false;
    
    const now = new Date();
    const diffMinutes = (now - lastUsed) / (1000 * 60);
    return diffMinutes < windowMinutes;
  }
}

module.exports = new TOTPService();