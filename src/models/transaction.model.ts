import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    amount: { required: true, type: Number },
    bank: { required: true, type: String },
    college: { required: true, type: String },
    department: { required: true, type: String },
    email: { required: true, type: String },
    fullName: { required: true, type: String },
    matricNumber: { required: true, type: String },
    paymentMethod: {
      default: "bank_transfer",
      enum: ["card", "bank_transfer"],
      required: true,
      type: String,
    },
    phoneNumber: { required: true, type: String },
    proofUrl: { required: true, type: String },
    reference: { type: String, unique: true },
    status: {
      default: "pending",
      enum: ["pending", "successful", "failed"],
      type: String,
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transactions", TransactionSchema);
export default Transaction;
