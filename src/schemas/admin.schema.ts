import Joi from "joi";

export const adminSchema = Joi.object({
  department: Joi.string().required().messages({
    "string.empty": "Department is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.!#$%^&*])[A-Za-z\d@.!#$%^&*]{8,30}$/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base": "Password must be 8–30 chars and include only letters, numbers, and @.!#$%^&*",
    }),
  role: Joi.string().valid("superAdmin", "departmentAdmin").required().messages({
    "any.only": "Role must be either 'superAdmin' or 'departmentAdmin'",
    "string.empty": "Role is required",
  }),
});
