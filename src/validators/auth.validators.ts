import Joi from "joi";

const signinSchema = Joi.object({
  identifier: Joi.alternatives(
    // email
    Joi.string().email(),
    // username
    Joi.string().min(3).max(50),
    // studentNo
    Joi.string().pattern(new RegExp(/^\d{7}$/)),
    // nationalCode
    Joi.string().pattern(new RegExp(/^\d{10}$/))
  ).required(),
  password: Joi.string(),
});

const signupSchema = Joi.object({
  firstName: Joi.string().max(25).required(),
  lastName: Joi.string().max(25).required(),
  username: Joi.string().min(3).max(25).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required(),
  confirmPassword: Joi.ref("password"),
  nationalCode: Joi.string()
    .pattern(new RegExp(/^\d{10}$/))
    .required(),
  studentNo: Joi.string().length(7).required(),
  birthDate: Joi.date().optional(),
});

const authQuerySchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  clientUri: Joi.string().required(),
});

export { signinSchema, signupSchema, authQuerySchema };
