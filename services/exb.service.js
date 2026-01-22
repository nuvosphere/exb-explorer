// services/exb.service.js
import axios from "axios";
import Exb from "../models/exb.model.js";
import { redlock } from "../config/redisClient.js";
import logger from "../logger.js";
import dotenv from "dotenv";
import {getLastIngestedBlock, setLastIngestedBlock} from "./metadata.service.js";
dotenv.config();

let lastIngestedBlock = 0; 
// ^ In production, store in DB or config. 
//   E.g., read from a "Metadata" table on startup.

const { API_BASE_URL, START_BLOCK } = process.env;
let FIRST=true;
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
        logger.info("raw data: " + raw);
        parsedData = JSON.parse(raw);
      } catch (err) {
        logger.warn("Failed to parse mint data JSON:" + err.message);
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
    throw error;
  }
}

export async function pollNextBlocks() {
  

  try {
    // Load lastIngestedBlock from DB
    var lastIngestedBlock = await getLastIngestedBlock();

    if (FIRST && START_BLOCK) {
      lastIngestedBlock = Number(START_BLOCK);
      FIRST = false;
    }
    logger.info(`Last ingested block: ${lastIngestedBlock}`);

    const startBlock = lastIngestedBlock + 1;
    const endBlock = startBlock + 499;

    logger.info(`Polling block range [${startBlock}, ${endBlock}]`);

    const count = await pollExbsFromBlockRange(startBlock, endBlock);
    
      await setLastIngestedBlock(endBlock);
    if (count == 0) {
      logger.info("No new data found in that block range, maybe next time...");
    }
  } catch (error) {
    logger.error("pollNextBlocks encountered an error:" + error);
  }
}
