// routes/exb.route.js
import express from "express";
import { redisClient } from "../config/redisClient.js";
import Exb from "../models/exb.model.js";
import { Op } from "sequelize";
import logger from "../logger.js";

const router = express.Router();

/**
 * GET /api/exbs
 * Query: sender, recipient, token1, token2, blockMin, blockMax
 */
router.get("/", async (req, res) => {
  try {
    const {
      sender,
      recipient,
      token1,
      token2,
      blockMin,
      blockMax,
    } = req.query;

    const cacheKey = `exbs:${JSON.stringify(req.query)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug("Serving /api/exbs from cache");
      return res.json({ data: JSON.parse(cached), source: "cache" });
    }

    // Build "where" filter
    const where = {};
    if (sender) {
      where.sender = sender;
    }
    if (recipient) {
      where.recipient = recipient;
    }
    if (token1) {
      where.tick1 = token1;
    }
    if (token2) {
      where.tick2 = token2;
    }
    if (blockMin || blockMax) {
      where.blockNumber = {};
      if (blockMin) {
        where.blockNumber[Op.gte] = +blockMin;
      }
      if (blockMax) {
        where.blockNumber[Op.lte] = +blockMax;
      }
    }

    const exbs = await Exb.findAll({
      where,
      order: [["blockNumber", "DESC"]],
    });

    await redisClient.setEx(cacheKey, 60, JSON.stringify(exbs));
    return res.json({ data: exbs, source: "db" });
  } catch (error) {
    logger.error("Error in GET /api/exbs:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

