import { RequestHandler } from "express";
import sharp from "sharp";
import { saveFile } from "../utils/file-manager.js";
import path from "path";
import prisma from "../db/index.js";
import { ResponseBody, ResponseCode } from "../utils/response.js";
import { hash } from "../utils/encrypt.js";
import { signToken, TokenType } from "../utils/token.js";

const signinController: RequestHandler = async (req, res) => {};

const signupController: RequestHandler = async (req, res, next) => {
  const {
    email,
    username,
    studentNo,
    password,
    firstName,
    lastName,
    birthDate,
    phone,
  } = req.body;
  const { clientId, clientUri } = req.query;

  // If the student's card image was not sent
  if (!req.file) {
    res
      .status(400)
      .json(
        new ResponseBody(
          { msg: "Student's card image file was not sent" },
          true,
          ResponseCode.MISS_DATA
        )
      );
    return;
  }

  //#region Check client
  const client = await prisma.client.findFirst({
    where: {
      id: clientId.toString(),
    },
  });

  // If there is no such a client registered
  if (!client) {
    res.status(404).json(
      new ResponseBody(
        // TODO: Define a class for entities, specify the entity type in the body
        { msg: "There is no such a client available" },
        true,
        ResponseCode.RECORD_NOT_FOUND
      )
    );
    return;
  }
  // Else if the client exists but it hasn't been approved
  else if (!client.approved) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.DENEID));
    return;
  }
  //#endregion
  // Check if the student already exist
  const stdExists = await prisma.student.findFirst({
    where: {
      OR: [{ email }, { username }, { studentNo }],
    },
  });

  if (stdExists) {
    res
      .status(400)
      .json(new ResponseBody({}, true, ResponseCode.DUPLICATE_DATA));
    return;
  }

  //#region Begin transaction
  await prisma.$transaction(async (tx) => {
    try {
      //#region User storing proccess
      // Hash password
      const hashPassword = await hash(password);
      // Store student
      const student = await prisma.student.create({
        data: {
          studentNo,
          username,
          email,
          password: hashPassword,
          firstName,
          lastName,
          birthDate: birthDate && new Date(birthDate),
          phone,
        },
      });
      //#endregion

      //#region Saving Student's card image
      // Optimize the uploaded file and get it's uptimized buffer
      const optimizedFile = await sharp(req.file.buffer)
        .resize({ width: 800 })
        .webp({ quality: 80 })
        .toBuffer();

      // Store the optimized buffer data of the file
      // Relative path
      const savedFilePath = saveFile({
        file: optimizedFile,
        savePath: `private/students-card/${path.basename(
          req.file.originalname,
          path.extname(req.file.originalname)
        )}.webp`,
      });
      //#endregion

      //#region Student-card
      await prisma.studentCard.create({
        data: {
          img: savedFilePath,
          studentId: student.id,
        },
      });
      //#endregion

      // Generate token-id to be sent back to the client
      // TODO: Consider passing write options for the token generation
      const token = signToken(
        { id: student.id, clientId: client.id, clientUri: client.clientURI },
        TokenType.TOKEN_ID
      );

      res.status(201).json(
        new ResponseBody(
          {
            tokenID: token,
            clientId: client.id,
            clientUri: client.clientURI,
          },
          false,
          ResponseCode.CREATED
        )
      );
    } catch (error) {
      next(error);
      throw error;
    }
  });
  //#endregion
};

const accessTokenController: RequestHandler = async (req, res) => {};

export default { signinController, signupController, accessTokenController };
