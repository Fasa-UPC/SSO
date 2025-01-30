import { RequestHandler } from "express";
import User from "../db/models/User.js";
import sharp from "sharp";
import { saveFile } from "../utils/file-manager.js";
import path from "path";

const signinController: RequestHandler = async (req, res) => {};

const signupController: RequestHandler = async (req, res) => {
  //#region Signup proccessing
  // Check if the student already exist
  
  // Proceed if it doesn't exist
  // create new 

  //#endregion

  //#region Saving Student's card image
  const optimizedFile = await sharp(req.file.buffer)
    .resize({ width: 800 })
    .webp({ quality: 80 })
    .toBuffer();

  // TODO: Hash the filename using student's id and number
  saveFile({
    file: optimizedFile,
    savePath: `private/students-card/${path.basename(
      req.file.originalname,
      path.extname(req.file.originalname)
    )}.webp`,
  });
  //#endregion

  res.status(200).send("user was successfuly registered");
};

const accessTokenController: RequestHandler = async (req, res) => {};

export default { signinController, signupController, accessTokenController };
