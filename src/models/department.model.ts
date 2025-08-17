import mongoose, { Schema } from "mongoose";

const DepartmentSchema = new Schema(
  {
    code: { required: true, type: String, unique: true },
    name: { required: true, type: String },
  },
  { timestamps: true },
);

const Department = mongoose.model("Departments", DepartmentSchema);
export default Department;
