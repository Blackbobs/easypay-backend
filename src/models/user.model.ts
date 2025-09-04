import { College } from "#interface/college";
import { Department } from "#interface/deaprtment";
import { Role } from "#interface/role";
import { IUser } from "#interface/user";
import { model, Schema } from "mongoose";

const userSchema = new Schema<IUser>(
  {
    college: { enum: College, required: true, type: String },
    department: { enum: Department, required: true, type: String },
    email: { required: true, type: String },
    password: { required: true, type: String },
    role: { default: Role.admin, enum: Role, required: true, type: String },
    username: { required: true, type: String },
  },
  { timestamps: true },
);

const User = model<IUser>("User", userSchema);
export default User;
