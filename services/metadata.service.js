// services/metadata.service.js
import Metadata from "../models/metadata.model.js";
import logger from "../logger.js";

const LAST_BLOCK_KEY = "lastIngestedBlock";

export async function getLastIngestedBlock() {
  const record = await Metadata.findOne({ where: { key: LAST_BLOCK_KEY } });
  if (!record) {
    // If there's no record yet, default to 0
    return 0;
  }
  return parseInt(record.value, 10) || 0;
}

export async function setLastIngestedBlock(blockNumber) {
  try {
    // Upsert pattern: either create or update the row for `key=lastIngestedBlock`
    await Metadata.upsert({
      key: LAST_BLOCK_KEY,
      value: String(blockNumber),
    });
    logger.info(`Updated lastIngestedBlock => ${blockNumber}`);
  } catch (err) {
    logger.error("Failed to set lastIngestedBlock:", err);
  }
}

