import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "last_name",
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studentNo: {
      type: DataTypes.STRING(7),
      field: "student_no",
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    studentCardImg: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "student_card_img"
    },
  },
  {
    timestamps: true,
    tableName: "users",
    indexes: [
      {
        name: "identifier",
        unique: true,
        fields: ["username", "student_no", "email"],
      },
    ],
  }
);

export default User;
