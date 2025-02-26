import { Prisma } from "@prisma/client";

// Detemines if the error belongs to
const isPrismaError = (error: Error) => {
  return Boolean(
    error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientUnknownRequestError
  );
};

class ResponseError extends Error {
  errorCode: number;
  statusCode: number;
  body: object;
  constructor(code: number, statusCode: number, body: object, message?: string) {
    super(message);
    this.name = "Response Error";
    this.errorCode = code;
    this.statusCode = statusCode;
    this.body = body;
  }
}

export { isPrismaError, ResponseError };
