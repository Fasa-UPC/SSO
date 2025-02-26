import express, { NextFunction, Request, Response } from "express";
import authRouter from "./routes/auth.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ResponseBody, ResponseCode } from "./utils/response.js";

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
  // Error handling and logging
  // TODO: Log the error for debugging purposes
  res
    .status(500)
    .json(
      new ResponseBody(
        { message: "Internal server error" },
        true,
        ResponseCode.INTERNAL_ERROR
      )
    );
});

export default app;
