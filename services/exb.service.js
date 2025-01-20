// services/exb.service.js
import axios from "axios";
import Exb from "../models/exb.model.js";
import { redlock } from "../config/redisClient.js";
import logger from "../logger.js";
import dotenv from "dotenv";
dotenv.config();

let lastIngestedBlock = 0; 
// ^ In production, store in DB or config. 
//   E.g., read from a "Metadata" table on startup.

const { API_BASE_URL } = process.env;

/**
 * Ingests exbs from [startBlock, endBlock].
 * Returns the number of minted records found.
 */
async function pollExbsFromBlockRange(startBlock, endBlock) {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL not set");
  }

  const url = `${API_BASE_URL}?startBlock=${startBlock}&endBlock=${endBlock}`;
  logger.info(`Fetching exbs from: ${url}`);

  try {
    const { data } = await axios.get(url);
    const { mints = [] } = data;
    // The API presumably doesn't return totalItems in this mode, or maybe it does.
    // We'll just rely on mints.length

    for (const mint of mints) {
      let parsedData;
      try {
        const raw = mint.data.replace(/^data:,/, "");
        parsedData = JSON.parse(raw);
      } catch (err) {
        logger.warn("Failed to parse mint data JSON:", err.message);
        continue;
      }

      const {
        from1,
        tick1,
        amt1,
        from2,
        tick2,
        amt2,
        comms = [],
      } = parsedData;

      await Exb.upsert({
        txHash: mint.tx_hash,
        blockNumber: Number(mint.block_number),
        sender: mint.sender,
        recipient: mint.recipient,
        from1,
        tick1,
        amt1,
        from2,
        tick2,
        amt2,
        comms,
        dataRaw: parsedData,
      });
    }

    logger.info(`Upserted ${mints.length} exbs for blocks [${startBlock}, ${endBlock}]`);
    return mints.length;
  } catch (error) {
    logger.error(`Error fetching blocks [${startBlock}, ${endBlock}]: ${error.message}`);
    return 0;
  }
}

export async function pollNextBlocks() {
  let lock;
  try {
    // Acquire concurrency lock
    lock = await redlock.acquire(["locks:exb-block-poller"], 10000);
  } catch (err) {
    logger.warn("Could not acquire lock, another instance might be running:", err.message);
    return;
  }

  try {
    // Load lastIngestedBlock from DB
    const lastIngestedBlock = await getLastIngestedBlock();
    const startBlock = lastIngestedBlock + 1;
    const endBlock = startBlock + 499;

    logger.info(`Polling block range [${startBlock}, ${endBlock}]`);

    const count = await pollExbsFromBlockRange(startBlock, endBlock);
    if (count > 0) {
      // We only advance if we actually got new data
      await setLastIngestedBlock(endBlock);
    } else {
      logger.info("No new data found in that block range, maybe next time...");
    }
  } catch (error) {
    logger.error("pollNextBlocks encountered an error:", error);
  } finally {
    try {
      await lock.release();
    } catch (releaseErr) {
      logger.warn("Error releasing lock:", releaseErr.message);
    }
  }
}
