const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/db');

class Achievement extends Model { }

Achievement.init({
    date: DataTypes.STRING,
    title: DataTypes.STRING,
    detail: DataTypes.TEXT
}, {
    sequelize,
    modelName: 'Achievement'
});

module.exports = Achievement;
