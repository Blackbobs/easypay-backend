import type { Document, Types } from "mongoose";

export interface AdminInput {
  department: string;
  email: string;
  password: string;
  role: string;
}

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  department: string;
  email: string;
  password: string;
  role: string;
  updatedAt: Date;
}
