import express from "express";
import authControllers from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/signin", authControllers.signinController);
router.post("/signup", authControllers.signupController);
router.post("/access-token", authControllers.accessTokenController);

export default router;
