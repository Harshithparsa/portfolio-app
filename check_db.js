require('dotenv').config();
const mongoose = require('mongoose');
const Portfolio = require('./server/models/Portfolio');

async function checkDB() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const portfolio = await Portfolio.findOne();
        if (portfolio) {
            console.log('Portfolio found:');
            console.log('Profile Image:', portfolio.profile.profileImage);
            console.log('Name:', portfolio.profile.name);
        } else {
            console.log('No portfolio found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDB();
