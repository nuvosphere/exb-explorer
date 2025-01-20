// models/exb.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Exb = sequelize.define("Exb", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  blockNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tick1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amt1: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  from2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tick2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amt2: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  comms: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  dataRaw: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "exbs",
  timestamps: true,
});

export default Exb;

