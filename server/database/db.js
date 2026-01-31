const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
    // Production: PostgreSQL
    console.log('🔌 Connecting to PostgreSQL...');
    sequelize = new Sequelize(process.env.POSTGRES_URL || process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Development: SQLite
    console.log('📂 Connecting to Local SQLite...');
    const storagePath = path.join(__dirname, '../../database.sqlite');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false
    });
}

module.exports = sequelize;
