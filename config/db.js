// config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

import logger from "../logger.js";

const {
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: (msg) => logger.debug(msg),
});

try {
  await sequelize.authenticate();
  logger.info("Database connection has been established successfully.");
} catch (error) {
  logger.error("Unable to connect to the database:", error);
  process.exit(1);
}

export default sequelize;

