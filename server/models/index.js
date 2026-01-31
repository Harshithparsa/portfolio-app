const sequelize = require('../database/db');
const User = require('./User');
const Profile = require('./Profile');
const Project = require('./Project');
const SkillCategory = require('./SkillCategory');
const Certificate = require('./Certificate');
const Achievement = require('./Achievement');
const AnalyticsEvent = require('./AnalyticsEvent');

// Define relationships if needed. 
// For a single-user portfolio, simple tables are often enough, 
// but linking everything to User allows for multi-user expansion later.

// Profile belongs to User??? 
// Since this is a simple portfolio, we might just assume the first Profile found is THE profile.
// But let's look at the old code: it just did `Portfolio.findOne()`.
// Detailed relationships aren't strictly necessary if we just query the tables directly,
// but they help with cascading deletes and joins.

// Let's create a "Portfolio" wrapper object concept for the API to match the old Mongoose structure
// which was: { profile, skills, projects, certificates, achievements }

const models = {
    User,
    Profile,
    Project,
    SkillCategory,
    Certificate,
    Achievement,
    AnalyticsEvent
};

// Sync models with database
// In production, use migrations instead of sync()
sequelize.sync({ alter: true }).then(() => {
    console.log('✅ SQLite Database synced');
}).catch(err => {
    console.error('❌ Database sync failed:', err);
});

module.exports = models;
