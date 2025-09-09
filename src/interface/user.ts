import { Document, Types } from "mongoose";

import { College } from "./college.js";
import { Department } from "./deaprtment.js";
import { DueType } from "./due-type.js";
import { Role } from "./role.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  college: College;
  createdAt: Date;
  department: Department;
  dueType: DueType,
  email: string;
  password: string;
  role: Role;
  updatedAt: Date;
  username: string;
}
