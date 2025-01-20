// models/metadata.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Metadata = sequelize.define(
  "Metadata",
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "metadata",
    timestamps: true, // createdAt, updatedAt
  }
);

export default Metadata;

