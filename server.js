// server.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import logger from "./logger.js";
import cron from "node-cron";
import { pollNextBlocks } from "./services/exb.service.js";
import exbRouter from "./routes/exb.route.js";

// Ensure models are imported (so Sequelize associates them), but do NOT sync
import "./models/exb.model.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Exb Service is running with block-based ingestion...");
});

// Routes
app.use("/api/exbs", exbRouter);

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Cron job every minute
cron.schedule("* * * * *", async () => {
  logger.info("Cron job triggered -> pollNextBlocks");
  await pollNextBlocks();
});

// Graceful shutdown
function shutdown() {
  logger.info("Received kill signal, shutting down gracefully...");
  server.close(() => {
    logger.info("Closed out remaining connections. Exiting now.");
    process.exit(0);
  });
  // If still not closed in 10s, force exit
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

