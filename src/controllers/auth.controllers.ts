import { RequestHandler } from "express";
import sharp from "sharp";
import { saveFile } from "../utils/file-manager.js";
import path from "path";
import prisma from "../db/index.js";
import {
  ResponseBody,
  ResponseBodyKey,
  ResponseCode,
  ResponseRecord,
} from "../utils/response.js";
import { compare, hash } from "../utils/encrypt.js";
import {
  signToken,
  TokenIDPayloadType,
  TokenType,
  validateToken,
} from "../utils/token.js";
import { ResponseError, isPrismaError } from "../utils/error.js";
import jwt from "jsonwebtoken";

class AuthController {
  static signinController: RequestHandler = async (req, res, next) => {
    try {
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
        throw new ResponseError(
          ResponseCode.RECORD_NOT_FOUND,
          404,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "client was not found"
        );
      }
      // else If there is the client but the client is not approved
      else if (!client.approved) {
        throw new ResponseError(
          ResponseCode.DENEID,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "client was not approved"
        );
      }
      // Else if the client is expired
      else if (client.validTo && client.validTo.getTime() < Date.now()) {
        throw new ResponseError(
          ResponseCode.EXPIRED,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "client is expired"
        );
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
        throw new ResponseError(
          ResponseCode.WRONG_CREDENTIALS,
          400,
          {},
          "Wrong credentials"
        );
      }
      // Check if the password matches
      else if (!compare(student.password, password)) {
        throw new ResponseError(
          ResponseCode.WRONG_CREDENTIALS,
          400,
          {},
          "Wrong credentials"
        );
      }
      //#endregion

      //#region Creating response proccess
      const token = signToken(
        { id: student.id, clientId: client.id, clientUri: client.clientURI },
        TokenType.TOKEN_ID
      );

      res.status(200).json(
        new ResponseBody(
          {
            [ResponseBodyKey.TokenID]: token,
            [ResponseBodyKey.ClientID]: client.id,
            [ResponseBodyKey.ClientURI]: client.clientURI,
          },
          false,
          ResponseCode.SUCCESS
        )
      );
      //#endregion
    } catch (error) {
      if (error instanceof ResponseError) {
        res
          .status(error.statusCode)
          .json(
            new ResponseBody(
              { ...error.body, message: error.message },
              true,
              error.errorCode
            )
          );
        return;
      } else {
        next(error);
      }
    }
  };

  static signupController: RequestHandler = async (req, res, next) => {
    try {
      const {
        email,
        username,
        studentNo,
        password,
        firstName,
        lastName,
        birthDate,
        phone,
        nationalCode,
      } = req.body;
      const { clientId, clientUri } = req.query;

      // If the student's card image was not sent
      if (!req.file) {
        throw new ResponseError(
          ResponseCode.MISS_DATA,
          400,
          {
            [ResponseBodyKey.Data]: ResponseRecord.StudentCard,
          },
          "Student's card image file was not provided"
        );
      }

      //#region Check client
      const client = await prisma.client.findFirst({
        where: {
          id: clientId.toString(),
        },
      });

      // If there is no such a client registered
      if (!client) {
        throw new ResponseError(
          ResponseCode.RECORD_NOT_FOUND,
          404,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "Client was not found"
        );
      }
      // Else if the client exists but it hasn't been approved
      else if (!client.approved) {
        throw new ResponseError(
          ResponseCode.DENEID,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "client is not approved"
        );
      }
      // Else if the client is expired
      else if (client.validTo && client.validTo.getTime() < Date.now()) {
        throw new ResponseError(
          ResponseCode.EXPIRED,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "client is expired"
        );
      }
      //#endregion
      // Check if the student already exist
      const stdExists = await prisma.student.findFirst({
        where: {
          OR: [{ email }, { username }, { studentNo }, { nationalCode }],
        },
      });

      if (stdExists) {
        throw new ResponseError(
          ResponseCode.DUPLICATE_DATA,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Student,
          },
          "Student already exists"
        );
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
              nationalCode,
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

          // Hashes student's id for saving as filename
          const filename = await hash(student.id);
          // Store the optimized buffer data of the file
          // Relative path
          const savedFilePath = saveFile({
            file: optimizedFile,
            savePath: `private/students-card/${filename}.webp`,
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

          res.status(201).json(
            new ResponseBody(
              {
                clientId: client.id,
                clientUri: client.clientURI,
              },
              false,
              ResponseCode.CREATED
            )
          );
        } catch (error) {
          // Throw error to be caught in outer try/catch
          throw error;
        }
      });
      //#endregion
    } catch (error) {
      if (isPrismaError(error)) {
        // TODO: Handle errors that belong to prisma
      } else if (error instanceof ResponseError) {
        res
          .status(error.statusCode)
          .json(
            new ResponseBody(
              { ...error.body, message: error.message },
              true,
              error.errorCode
            )
          );
      } else {
        next(error);
      }
    }
  };

  static accessTokenController: RequestHandler = async (req, res, next) => {
    try {
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
        throw new ResponseError(
          ResponseCode.RECORD_NOT_FOUND,
          404,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "Client was not found"
        );
      }
      // else If there is the client but the client is not approved
      else if (!client.approved) {
        throw new ResponseError(
          ResponseCode.DENEID,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "Client was not approved"
        );
      }
      // Else if the client is expired
      else if (client.validTo && client.validTo.getTime() < Date.now()) {
        throw new ResponseError(
          ResponseCode.EXPIRED,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "Client is expired"
        );
      }
      // Else if the secret is wrong
      else if (client.secret !== clientSecret) {
        throw new ResponseError(
          ResponseCode.DENEID,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Client,
          },
          "Client secret is not valid"
        );
      }

      let payload: TokenIDPayloadType;
      try {
        // Verify and decode token's payload data
        payload = validateToken(
          tokenID,
          TokenType.TOKEN_ID
        ) as TokenIDPayloadType;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new ResponseError(ResponseCode.EXPIRED, 400, {}, error.message);
        } else {
          throw new Error(error.message);
        }
      }

      // Retrieve student's data from database
      const student = await prisma.student.findUnique({
        where: {
          id: payload.id,
        },
      });

      // Check if there is the student specified
      if (!student) {
        throw new ResponseError(
          ResponseCode.RECORD_NOT_FOUND,
          404,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Student,
          },
          "Student was not found"
        );
      }
      // Check if the student is approved
      else if (!student.approved) {
        throw new ResponseError(
          ResponseCode.DENEID,
          400,
          {
            [ResponseBodyKey.Record]: ResponseRecord.Student,
          },
          "Student was not approved"
        );
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
    } catch (error) {
      if (error instanceof ResponseError) {
        res
          .status(error.statusCode)
          .json(
            new ResponseBody(
              { ...error.body, message: error.message },
              true,
              error.errorCode
            )
          );
        return;
      } else {
        next(error);
      }
    }
  };
}

export default AuthController;
