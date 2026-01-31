const { Sequelize } = require('sequelize');
const path = require('path');

// Determine storage path
const storagePath = process.env.DATABASE_STORAGE || path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false, // Set to console.log to see SQL queries
    // For production with Postgres, you would adjust this config:
    // dialect: 'postgres',
    // host: process.env.DB_HOST,
    // ...
});

module.exports = sequelize;
