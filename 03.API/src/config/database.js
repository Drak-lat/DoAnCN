const { Sequelize } = require('sequelize');
const path = require('path');

// Ensure dotenv is loaded from the API project root (parent of src)
// API .env lives at the project root (two levels above this file: src/config -> src -> 03.API)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;