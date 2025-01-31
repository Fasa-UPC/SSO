import Joi from "joi";

const signinSchema = Joi.object({
  identifier: Joi.alternatives(
    Joi.string().email(),
    Joi.string().min(3).max(25),
    Joi.string().length(7)
  ).required(),
  password: Joi.string(),
});

const signupSchema = Joi.object({
  firstname: Joi.string().max(25).required(),
  lastname: Joi.string().max(25).required(),
  username: Joi.string().min(3).max(25).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required(),
  confirmPassword: Joi.ref("password"),
  studentNo: Joi.string().length(7).required(),
  birthDate: Joi.date().optional(),
});

const authQuerySchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  clientUri: Joi.string().required(),
});

export { signinSchema, signupSchema, authQuerySchema };
