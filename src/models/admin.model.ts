import type { IAdmin } from "#interface/admin.js";

import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema<IAdmin>(
  {
    department: { required: true, type: String },
    email: { required: true, type: String, unique: true },
    password: { required: true, type: String },
    role: { default: "departmentAdmin", enum: ["superAdmin", "departmentAdmin"], required: true },
  },
  { timestamps: true },
);
const Admin = mongoose.model<IAdmin>("Admins", AdminSchema);
export default Admin;
