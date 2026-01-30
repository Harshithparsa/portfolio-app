const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Define User schema inline
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  twoFactorBackupCodes: [{ code: String, used: Boolean, usedAt: Date }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Credentials
    const username = 'Harshith-1030';
    const password = '6303964389';

    // Check if user exists
    let user = await User.findOne({ username });

    if (user) {
      console.log(`🔄 User '${username}' already exists. Updating password...`);
      user.password = await bcrypt.hash(password, 10);
      await user.save();
      console.log(`✅ Password updated for '${username}'`);
    } else {
      console.log(`📝 Creating new admin user '${username}'...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = new User({
        username,
        password: hashedPassword,
        email: 'admin@parsa.dev',
        twoFactorEnabled: false
      });

      await user.save();
      console.log(`✅ Admin user created successfully!`);
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n🔐 Login at: http://localhost:5000/admin-parsa-7734');

    await mongoose.connection.close();
    console.log('\n✅ Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
