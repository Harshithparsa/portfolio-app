const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate admin user with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        success: false
      });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.log(`[Auth] ❌ Login failed: User '${username}' not found`);
      return res.status(401).json({
        error: 'Invalid username or password',
        success: false
      });
    }

    // Check lock
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      console.log(`[Auth] ❌ Login failed: Account '${username}' is locked`);
      return res.status(403).json({
        error: 'Account is temporarily locked. Please try again later.',
        success: false
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log(`[Auth] ❌ Login failed: Invalid password for '${username}'`);

      // Increment failed attempts
      const newAttempts = (user.loginAttempts || 0) + 1;
      let lockUntil = user.lockUntil;

      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
      }

      await user.update({
        loginAttempts: newAttempts,
        lockUntil: lockUntil
      });

      return res.status(401).json({
        error: 'Invalid username or password',
        success: false
      });
    }

    // Success - Reset attempts
    await user.update({
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date()
    });

    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        userId: user.id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log(`[Auth] ✅ Login successful for user '${username}'`);

    return res.json({
      token,
      success: true,
      user: {
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('[Auth] Error during login:', error);
    return res.status(500).json({
      error: 'Server error during authentication',
      success: false
    });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
