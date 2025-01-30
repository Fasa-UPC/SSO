import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    validTo: {
      type: DataTypes.DATE,
      field: "valid-to",
      allowNull: true,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    clientURI: {
      type: DataTypes.STRING,
      field: "client-uri",
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "clients",
  }
);

export default Client;
