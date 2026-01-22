// config/db.js (in CommonJS style for CLI usage):
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "exp",
    password: process.env.DB_PASS || "pw2015",
    database: process.env.DB_NAME || "exbs",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres"
  },
  test: {
    // ...
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  }
};

