require('dotenv').config();
const mongoose = require('mongoose');
const Portfolio = require('./server/models/Portfolio');

async function patchProfileImage() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            console.error('No portfolio found to update!');
            process.exit(1);
        }

        const imagePath = '/uploads/profile/profile-1769103078485-910446996.jpeg';

        console.log('Current Profile Image:', portfolio.profile.profileImage);
        console.log('Updating to:', imagePath);

        portfolio.profile.profileImage = imagePath;
        portfolio.markModified('profile'); // Ensure mongoose tracks the change

        await portfolio.save();
        console.log('Successfully updated profile image.');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

patchProfileImage();
