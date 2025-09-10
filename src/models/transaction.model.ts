import { Department } from "#interface/deaprtment.js";
import { DueType } from "#interface/due-type.js";
import { PaymentMethod } from "#interface/payment-method.js";
import { Status } from "#interface/status.js";
import { ITransaction } from "#interface/transaction.js";
import { model, Schema } from "mongoose";

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: { required: true, type: Number },
    bank: { required: true, type: String },
    college: { required: true, type: String },
    department: { enum: Department, required: true, type: String },
    dueType: { enum: Object.values(DueType), required: true, type: String },
    email: { required: true, type: String },
    fullName: { required: true, type: String },
    matricNumber: { required: true, type: String },
    paymentMethod: {
      default: PaymentMethod.bank_transfer,
      enum: PaymentMethod,
      required: true,
      type: String,
    },
    phoneNumber: { required: true, type: String },
    proofUrl: { required: true, type: String },
    receiptName: { type: String },
    reference: { type: String, unique: true },
    status: {
      default: Status.pending,
      enum: Status,
      type: String,
    },
  },
  { timestamps: true },
);

const Transaction = model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
