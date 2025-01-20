// config/redisClient.js
import { createClient } from "redis";
import Redlock from "redlock";
import dotenv from "dotenv";
dotenv.config();
import logger from "../logger.js";

const { REDIS_HOST, REDIS_PORT } = process.env;

export const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

await redisClient.connect();
logger.info("Redis connected!");

// Create Redlock instance for concurrency lock
export const redlock = new Redlock([redisClient], {
  retryCount: 3,
  retryDelay: 150,
});

