import { RequestHandler } from "express";
import { ObjectSchema } from "joi";

type DataValidationMiddleware = (schema: ObjectSchema) => RequestHandler;

const dataValidationMiddleware: DataValidationMiddleware = (schema) => {
  return async function (req, res, next) {
    
  };
};
