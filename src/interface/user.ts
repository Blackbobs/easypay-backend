import { Document, Types } from "mongoose";

import { College } from "./college";
import { Department } from "./deaprtment";
import { Role } from "./role";

export interface IUser extends Document {
  _id: Types.ObjectId;
  college: College;
  createdAt: Date;
  department: Department;
  email: string;
  password: string;
  role: Role;
  updatedAt: Date;
  username: string;
}
