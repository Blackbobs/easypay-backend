import Joi from "joi";

export const transactionSchema = Joi.object({
  amount: Joi.number(),
  college: Joi.string().required().messages({
    "any.required": "College is required",
  }),
  department: Joi.string(),
  dueType: Joi.string().required().messages({
    "string.empty": "due type is required",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be valid",
  }),
  fullName: Joi.string().required().messages({
    "any.required": "Full name is required",
    "string.base": "Full name must be a string",
  }),
  hostel: Joi.string(),
  level: Joi.string(),
  matricNumber: Joi.string().required().messages({
    "any.required": "Matric number is required",
    "string.base": "Matric number must be a string",
  }),
  paymentMethod: Joi.string()
    .valid("card", "bank_transfer")
    .default("bank_transfer") // ✅ handled here
    .messages({
      "any.only": "Payment method must be 'card' or 'bank_transfer'",
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Phone number must be 10–15 digits",
    }),
  proofUrl: Joi.string().required().messages({
    "any.required": "Proof URL is required",
  }),
  receiptName: Joi.string(),
  reference: Joi.string().messages({
    "any.required": "Reference is required",
  }),
  roomNumber: Joi.string(),
  status: Joi.string().valid("pending", "successful", "failed").default("pending").messages({
    "any.only": "Status must be 'pending', 'successful', or 'failed'",
  }),
  studentType: Joi.string(),
});
