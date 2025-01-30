import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const StudentCard = sequelize.define(
  "StudentCard",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    studentNo: {
      type: DataTypes.STRING,
      field: "student-no",
      allowNull: false,
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true, tableName: "students-card" }
);


export default StudentCard;
