const { User } = require('../models');

async function ensureAdmin() {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if any user exists
        const admin = await User.findOne({ where: { username: adminUsername } });

        if (!admin) {
            console.log('Admin user not found. Creating default admin...');
            await User.create({
                username: adminUsername,
                password: adminPassword, // Hook will hash it
                email: 'admin@example.com'
            });
            console.log(`✅ Admin user created: ${adminUsername}`);
        } else {
            console.log(`✅ Admin user exists: ${adminUsername}`);
        }
    } catch (error) {
        console.error('❌ Error checking/creating admin user:', error);
    }
}

module.exports = ensureAdmin;
