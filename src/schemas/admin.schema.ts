import type { AdminInput } from "#interface/admin.js";

import Joi from "joi";

export const adminSchema = Joi.object<AdminInput>({
  department: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3-30}$")).required(),
  role: Joi.string().required(),
});
