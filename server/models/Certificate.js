const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/db');

class Certificate extends Model { }

Certificate.init({
    title: DataTypes.STRING,
    issuer: DataTypes.STRING,
    date: DataTypes.STRING, // Kept as string to match previous schema flexibly, or use DATEONLY
    link: { type: DataTypes.STRING, defaultValue: '' },
    badgeIcon: { type: DataTypes.STRING, defaultValue: '' }
}, {
    sequelize,
    modelName: 'Certificate'
});

module.exports = Certificate;
