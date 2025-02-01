import { RequestHandler } from "express";
import sharp from "sharp";
import { saveFile } from "../utils/file-manager.js";
import path from "path";
import prisma from "../db/index.js";
import { ResponseBody, ResponseCode } from "../utils/response.js";
import { compare, hash } from "../utils/encrypt.js";
import {
  signToken,
  TokenIDPayloadType,
  TokenType,
  validateToken,
} from "../utils/token.js";

const signinController: RequestHandler = async (req, res) => {
  const { identifier, password } = req.body;
  const { clientId, clientUri } = req.query;

  //#region Validation proccess
  const client = await prisma.client.findUnique({
    where: {
      id: clientId.toString(),
    },
  });

  // If there is no such client
  if (!client) {
    res
      .status(404)
      .json(new ResponseBody({}, true, ResponseCode.RECORD_NOT_FOUND));
    return;
  }
  // else If there is the client but the client is not approved
  else if (!client.approved) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.DENEID));
    return;
  }
  // Else if the client is expired
  else if (client.validTo && client.validTo.getTime() < Date.now()) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.EXPIRED));
    return;
  }

  // Find the student by idetifier provided by the student
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier },
        { studentNo: identifier },
      ],
    },
  });

  // If there is no such a student exist
  if (!student) {
    res
      .status(404)
      .json(new ResponseBody({}, true, ResponseCode.RECORD_NOT_FOUND));
    return;
  }
  // Check if the password matches
  else if (!compare(student.password, password)) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.DENEID));
    return;
  }
  //#endregion

  //#region Creating response proccess
  const token = signToken(
    { id: student.id, clientId: client.id, clientUri: client.clientURI },
    TokenType.TOKEN_ID
  );

  res
    .status(200)
    .json(
      new ResponseBody(
        { tokenID: token, clientId: client.id, clientUri: client.clientURI },
        false,
        ResponseCode.SUCCESS
      )
    );
  //#endregion
};

const signupController: RequestHandler = async (req, res) => {
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
  // Else if the client is expired
  else if (client.validTo && client.validTo.getTime() < Date.now()) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.EXPIRED));
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
      // const token = signToken(
      //   { id: student.id, clientId: client.id, clientUri: client.clientURI },
      //   TokenType.TOKEN_ID
      // );

      res.status(201).json(
        new ResponseBody(
          {
            // tokenID: token,
            clientId: client.id,
            clientUri: client.clientURI,
          },
          false,
          ResponseCode.CREATED
        )
      );
    } catch (error) {
      // TODO: Handle error (pass them to next function)
    }
  });
  //#endregion
};

const accessTokenController: RequestHandler = async (req, res) => {
  const { tokenID, clientSecret } = req.body;
  const { clientId, clientUri } = req.query;

  // Validate client info
  const client = await prisma.client.findFirst({
    where: {
      id: clientId.toString(),
    },
  });

  // If there is no such client
  if (!client) {
    res
      .status(404)
      .json(new ResponseBody({}, true, ResponseCode.RECORD_NOT_FOUND));
    return;
  }
  // else If there is the client but the client is not approved
  else if (!client.approved) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.DENEID));
    return;
  }
  // Else if the client is expired
  else if (client.validTo && client.validTo.getTime() < Date.now()) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.EXPIRED));
    return;
  }
  // Else if the secret is wrong
  else if (client.secret !== clientSecret) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.DENEID));
    return;
  }

  // Verify and decode token's payload data
  const payload = validateToken(
    tokenID,
    TokenType.TOKEN_ID
  ) as TokenIDPayloadType;

  // Retrieve student's data from database
  const student = await prisma.student.findUnique({
    where: {
      id: payload.id,
    },
  });

  // Check if there is the student specified
  if (!student) {
    res
      .status(404)
      .json(new ResponseBody({}, true, ResponseCode.RECORD_NOT_FOUND));
    return;
  }
  // Check if the student is approved
  else if (!student.approved) {
    res.status(400).json(new ResponseBody({}, true, ResponseCode.DENEID));
    return;
  }

  // Define jwtPayload's data object
  const jwtPayload = {
    id: student.id,
    username: student.username,
    studentNo: student.studentNo,
  };

  // Sign a newly generated jwt-token
  const token = signToken(jwtPayload, TokenType.JWT);

  // Send back the token to the client
  res
    .status(200)
    .json(new ResponseBody({ token }, false, ResponseCode.SUCCESS));
};

export default { signinController, signupController, accessTokenController };
