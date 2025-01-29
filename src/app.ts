import express from "express";
import authRouter from "./routes/auth.route.js";
import cors from "cors";

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

app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  // Error handling
});

export default app;
