const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/db');

class Project extends Model { }

Project.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    tags: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('tags', JSON.stringify(value));
        }
    },
    imageUrl: { type: DataTypes.STRING, defaultValue: '' },
    githubLink: { type: DataTypes.STRING, defaultValue: '' },
    liveLink: { type: DataTypes.STRING, defaultValue: '' },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    sequelize,
    modelName: 'Project'
});

module.exports = Project;
