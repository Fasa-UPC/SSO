import { RequestHandler } from "express";
import { ObjectSchema } from "joi";
import { ResponseBody, ResponseCode } from "../utils/response.js";

type DataValidationMiddleware = (
  schema: ObjectSchema,
  source?: ValidationSource
) => RequestHandler;
type ValidationSource = "body" | "query";

const dataValidationMiddleware: DataValidationMiddleware = (
  schema,
  source?
) => {
  return async function (req, res, next) {
    let data = null;
    switch (source) {
      case "query":
        data = req.query;
        break;
      case "body":
      default:
        data = req.body;
    }
    const { error } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      res
        .status(400)
        .json(new ResponseBody(error.details, true, ResponseCode.INVALID_DATA));
      return;
    }

    next();
  };
};

export default dataValidationMiddleware;
