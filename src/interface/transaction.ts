import { Document } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  createdAt: Date;
  matricNumber: string;
  paymentMethod: "bank_transfer" | "card";
  reference: string;
  status: "failed" | "pending" | "successful";
  studentName: string;
  updatedAt: Date;
}
