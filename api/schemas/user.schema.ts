import Joi from "joi";

export const userSchema = Joi.object({
  college: Joi.string().required().messages({
    "string.empty": "College is required",
  }),
  department: Joi.string().required().messages({
    "string.empty": "Department is required",
  }),
  dueType: Joi.string().required().messages({
    "string.empty": "due type is required"
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string:email": "Please enter a valid email address",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.!#$%^&*])[A-Za-z\d@.!#$%^&*]{8,30}$/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base": "Password must be 8-30 chars and include only letters, numbers, and @.!#$%^&*",
    }),
    receiptName: Joi.string().required().messages({
      "string.empty": "Receipt name is required",
    }),
  role: Joi.string().valid("admin", "superAdmin").required().messages({
    "any.only": "Role must be either 'admin' or 'superAdmin'",
    "string.empty": "Role is required",
  }),
  username: Joi.string().required().messages({
    "string.empty": "Username is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.!#$%^&*])[A-Za-z\d@.!#$%^&*]{8,30}$/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base": "Password must be 8-30 chars and include only letters, numbers, and @.!#$%^&*",
    }),
});
