import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const signToken = (payload: any, options: SignOptions) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);

  return token;
};

const validateToken = (token: string, options: VerifyOptions) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET, options);

  return payload;
};

export { signToken, validateToken };
