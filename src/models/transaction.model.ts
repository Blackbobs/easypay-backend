import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    amount: { required: true, type: Number },
    email: { required: true, type: String },
    fullName: { required: true, type: String },
    matricNumber: { required: true, type: String },
    paymentMethod: { enum: ["card", "bank_transfer"], type: String },
    phoneNumber: { required: true, type: String },
    proofUrl: { required: true, type: String },
    reference: { required: true, type: String, unique: true },
    status: { default: "pending", enum: ["pending", "successful", "failed"], type: String },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transactions", TransactionSchema);
export default Transaction;
