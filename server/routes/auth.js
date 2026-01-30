const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate admin user with username and password
 * Returns JWT token valid for 24 hours
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        success: false 
      });
    }

    // Find user in database
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`[Auth] ❌ Login failed: User '${username}' not found`);
      return res.status(401).json({ 
        error: 'Invalid username or password',
        success: false 
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      console.log(`[Auth] ❌ Login failed: Account '${username}' is locked`);
      return res.status(403).json({ 
        error: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
        success: false 
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log(`[Auth] ❌ Login failed: Invalid password for '${username}'`);
      await user.recordFailedLogin();
      return res.status(401).json({ 
        error: 'Invalid username or password',
        success: false 
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username,
        email: user.email,
        userId: user._id
      }, 
      process.env.JWT_SECRET, 
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

/**
 * POST /api/auth/logout
 * Simple logout endpoint (token invalidation on client side)
 */
router.post('/logout', (req, res) => {
  // Token invalidation typically happens on client side
  // Server would need token blacklist for server-side logout
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
