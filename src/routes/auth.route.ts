import express from "express";
import authControllers from "../controllers/auth.controllers.js";
import dataValidationMiddleware from "../middlewares/data-validation.middleware.js";
import {
  authQuerySchema,
  signinSchema,
  signupSchema,
} from "../validators/auth.validators.js";
import multer, { memoryStorage } from "multer";

const router = express.Router();

router.post(
  "/signin",
  dataValidationMiddleware(signinSchema),
  dataValidationMiddleware(authQuerySchema, "query"),
  authControllers.signinController
);

router.post(
  "/signup",
  multer({ storage: memoryStorage() }).single("studentCard"),
  dataValidationMiddleware(signupSchema),
  dataValidationMiddleware(authQuerySchema, "query"),
  authControllers.signupController
);

router.post("/access-token", authControllers.accessTokenController);

export default router;
