import Joi from "joi";

export const transactionSchema = Joi.object({
    amount: Joi.number()
    .required()
    .messages({
        "any.required": "Amount is required",
        "number.base": "Amount must be a number",
    }),
    email: Joi.string()
    .required()
    .messages({
        "any.required": "Email is required",
        "string.base": "Email must be a string"
    }),
    fullName: Joi.string()
    .required()
    .messages({
        "any.required": "Full name is required",
        "string.base": "Full name must be a string"
    }),
    matricNumber: Joi.string()
    .required()
    .messages({
        "any.reuired": "Matirc number is required",
        "string.base": "Matric number must be a string"
    }),
    paymentMethod: Joi.string()
    .valid("card", "bank_transfer")
    .required()
    .messages({
        "any.only": "Payment must be either  'card' or 'bank_transfer'",
        "any.required": "Payment method is required"
    }),
    phoneNumber: Joi.string()
    .required()
    .messages({
        "any.required": "Phone number is required",
        "string.base": "Phone number must be a string"
    }),
    proofUrl: Joi.string()
    .required()
    .messages({
        "any.required": "Proof URL is required",
        "string.base": "Proof URL must be a string"
    }),
    reference: Joi.string(),
    // .required()
    // .messages({
    //     "any.required": "Reference is required",
    //     "string.base": "Reference must be a string"
    // }),
    status: Joi.string()
    .valid("pending", "successful", "failed")
    .default("pending")
    .messages({
        "any.only": "Status must  be 'pending', 'successful', or 'failed'"
    }),
    studentName: Joi.string()
    .required()
    .messages({
        "any.required": "Student Name is required",
        "string.base": "Student name must be a string"
    })

})