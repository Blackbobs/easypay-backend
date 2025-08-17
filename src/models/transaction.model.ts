import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    amount: { required: true, type: Number },
    matricNumber: { required: true, type: String },
    paymentMethod: { enum: ["card", "bank_transfer"], type: String },
    reference: { required: true, type: String, unique: true },
    status: { default: "pending", enum: ["pending", "successful", "failed"], type: String },
    studentName: { required: true, type: String },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transactions", TransactionSchema);
export default Transaction;
