import { RequestHandler } from "express";
import User from "../db/models/User.js";

const signinController: RequestHandler = async (req, res) => {};

const signupController: RequestHandler = async (req, res) => {};

const accessTokenController: RequestHandler = async (req, res) => {};

export default { signinController, signupController, accessTokenController };
