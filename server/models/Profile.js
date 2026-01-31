const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/db');

class Profile extends Model { }

Profile.init({
    name: { type: DataTypes.STRING, defaultValue: 'Harshith' },
    tagline: { type: DataTypes.STRING, defaultValue: 'Full-Stack Developer & MERN Specialist' },
    about: { type: DataTypes.TEXT, defaultValue: 'Building high-performance web applications' },
    email: { type: DataTypes.STRING, defaultValue: 'admin@parsa.dev' },
    phone: { type: DataTypes.STRING, defaultValue: '+91 9014975103' },
    location: { type: DataTypes.STRING, defaultValue: 'India' },
    profileImage: { type: DataTypes.STRING, defaultValue: '' },
    resumeUrl: { type: DataTypes.STRING, defaultValue: '' },
    cvUrl: { type: DataTypes.STRING, defaultValue: '' },
    socials: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '{}',
        get() {
            const rawValue = this.getDataValue('socials');
            return rawValue ? JSON.parse(rawValue) : {
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
                twitter: 'https://twitter.com',
                portfolio: 'https://parsa.dev'
            };
        },
        set(value) {
            this.setDataValue('socials', JSON.stringify(value));
        }
    }
}, {
    sequelize,
    modelName: 'Profile'
});

module.exports = Profile;
