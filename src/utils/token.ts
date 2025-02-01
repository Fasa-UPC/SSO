import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

enum TokenType {
  JWT,
  TOKEN_ID,
}

type TokenIDPayloadType = {
  id: string;
  clientId: string;
  clientUri: string;
};

const signToken = (payload: any, type: TokenType, options?: SignOptions) => {
  const token = jwt.sign(
    payload,
    type === TokenType.JWT
      ? process.env.JWT_SECRET
      : process.env.TOKEN_ID_SECRET,
    options
  );

  return token;
};

const validateToken = (
  token: string,
  type: TokenType,
  options?: VerifyOptions
) => {
  const payload = jwt.verify(
    token,
    type === TokenType.JWT
      ? process.env.JWT_SECRET
      : process.env.TOKEN_ID_SECRET,
    options
  );

  return payload;
};

export { signToken, validateToken, TokenType, TokenIDPayloadType };
