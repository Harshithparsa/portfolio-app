const User = require('../models/User');

/**
 * Ensures a default admin account exists in the database on startup.
 * Uses environment variables ADMIN_USERNAME and ADMIN_PASSWORD.
 */
module.exports = async function ensureAdmin() {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.log('[Startup] ⚠️ ADMIN_PASSWORD not set. Skipping admin user creation.');
            return;
        }

        const existingAdmin = await User.findOne({ username: adminUsername });

        if (!existingAdmin) {
            console.log(`[Startup] Admin user '${adminUsername}' not found. Creating...`);

            const user = new User({
                username: adminUsername,
                password: adminPassword, // Pre-save hook will hash this
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                isAdmin: true,
                twoFactorEnabled: false
            });

            await user.save();
            console.log(`[Startup] ✅ Admin user '${adminUsername}' created successfully.`);
        } else {
            console.log(`[Startup] ✅ Admin user '${adminUsername}' verified in database.`);
        }
    } catch (error) {
        console.error('[Startup] ❌ Failed to ensure admin user:', error.message);
    }
};
