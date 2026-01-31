const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/db');

class AnalyticsEvent extends Model { }

AnalyticsEvent.init({
    visitorId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('page_view', 'click', 'download'),
        allowNull: false
    },
    page: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item: DataTypes.STRING,
    referrer: DataTypes.STRING,
    device: {
        type: DataTypes.ENUM('mobile', 'desktop', 'tablet'),
        defaultValue: 'desktop'
    },
    userAgent: DataTypes.STRING,
    ip: DataTypes.STRING
}, {
    sequelize,
    modelName: 'AnalyticsEvent',
    indexes: [
        { fields: ['visitorId'] },
        { fields: ['type'] },
        { fields: ['page'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = AnalyticsEvent;
