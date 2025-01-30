import express, { NextFunction, Request, Response } from "express";
import authRouter from "./routes/auth.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import User from "./db/models/User.js";
import Client from "./db/models/Client.js";
import sequelize from "./db/db.js";

const app = express();

// cors middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Error handling
});

export default app;
