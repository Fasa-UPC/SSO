import { RequestHandler } from "express";
import { ObjectSchema } from "joi";

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
      res.status(400).json(error.details);
      return;
    }

    next();
  };
};


export default dataValidationMiddleware;
