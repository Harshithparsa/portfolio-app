const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// 2FA Service - Two-Factor Authentication using Time-based One-Time Password (TOTP)
class TwoFactorService {
  constructor() {
    this.appName = 'Parsa Portfolio';
    this.issuer = 'parsa.dev';
  }

  /**
   * Generate a new 2FA secret and QR code
   * @param {string} email - User email
   * @returns {Promise<{secret, qrCode, backupCodes}>}
   */
  async generateSecret(email) {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${this.appName} (${email})`,
        issuer: this.issuer,
        length: 32
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes (10 codes for recovery)
      const backupCodes = this.generateBackupCodes();

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
        otpauth_url: secret.otpauth_url
      };
    } catch (error) {
      console.error('❌ 2FA secret generation error:', error);
      throw error;
    }
  }

  /**
   * Verify a TOTP token
   * @param {string} secret - Base32 encoded secret
   * @param {string} token - 6-digit token from authenticator
   * @returns {boolean}
   */
  verifyToken(secret, token) {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time windows (±30 seconds)
      });

      return verified;
    } catch (error) {
      console.error('❌ 2FA token verification error:', error);
      return false;
    }
  }

  /**
   * Enable 2FA for a user
   * @param {string} userId - User ID
   * @param {string} secret - 2FA secret
   * @param {array} backupCodes - Backup codes
   * @returns {Promise<boolean>}
   */
  async enable2FA(userId, secret, backupCodes) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          twoFactorSecret: secret,
          twoFactorBackupCodes: backupCodes.map(code => ({
            code: code,
            used: false,
            usedAt: null
          })),
          twoFactorEnabled: true,
          twoFactorSetupDate: new Date()
        },
        { new: true }
      );

      console.log(`✅ 2FA enabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Enable 2FA error:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA for a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async disable2FA(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: []
      });

      console.log(`🔓 2FA disabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Disable 2FA error:', error);
      throw error;
    }
  }

  /**
   * Verify and use a backup code
   * @param {string} userId - User ID
   * @param {string} code - Backup code
   * @returns {Promise<boolean>}
   */
  async verifyBackupCode(userId, code) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.twoFactorBackupCodes) {
        return false;
      }

      const backupCode = user.twoFactorBackupCodes.find(
        bc => bc.code === code && !bc.used
      );

      if (!backupCode) {
        console.log(`❌ Invalid or used backup code for user ${userId}`);
        return false;
      }

      // Mark code as used
      backupCode.used = true;
      backupCode.usedAt = new Date();

      await user.save();

      console.log(`✅ Backup code used by ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Backup code verification error:', error);
      return false;
    }
  }

  /**
   * Generate 10 backup codes
   * @returns {array}
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = this.generateRandomCode(8);
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate a random code
   * @param {number} length - Length of code
   * @returns {string}
   */
  generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get remaining backup codes count
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getRemainingBackupCodes(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.twoFactorBackupCodes) return 0;

      return user.twoFactorBackupCodes.filter(bc => !bc.used).length;
    } catch (error) {
      console.error('❌ Get backup codes error:', error);
      return 0;
    }
  }

  /**
   * Check if user has 2FA enabled
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async is2FAEnabled(userId) {
    try {
      const user = await User.findById(userId);
      return user && user.twoFactorEnabled === true;
    } catch (error) {
      console.error('❌ Check 2FA error:', error);
      return false;
    }
  }
}

module.exports = new TwoFactorService();
