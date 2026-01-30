require('dotenv').config();
const mongoose = require('mongoose');
const Portfolio = require('./server/models/Portfolio');

async function checkData() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const portfolio = await Portfolio.findOne();
        if (portfolio) {
            console.log(`Projects found: ${portfolio.projects.length}`);
            portfolio.projects.forEach(p => console.log(`- ${p.title} (${p.tags.join(', ')})`));

            console.log(`Achievements found: ${portfolio.achievements.length}`);
            portfolio.achievements.forEach(a => console.log(`- ${a.date}: ${a.title}`));
        } else {
            console.log('No portfolio found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
