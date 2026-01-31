const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/db');

class SkillCategory extends Model { }

SkillCategory.init({
    category: { type: DataTypes.STRING, allowNull: false },
    items: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('items');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('items', JSON.stringify(value));
        }
    }
}, {
    sequelize,
    modelName: 'SkillCategory'
});

module.exports = SkillCategory;
