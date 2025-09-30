import { DueType } from "#interface/due-type.js";
import { PaymentMethod } from "#interface/payment-method.js";
import { Status } from "#interface/status.js";
import { ITransaction } from "#interface/transaction.js";
import { model, Schema } from "mongoose";

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {  type: Number },
    college: { required: true, type: String },
    department: {  type: String },
    dueType: { enum: Object.values(DueType), required: true, type: String },
    email: { required: true, type: String },
    fullName: { required: true, type: String },
    hostel: {type: String},
    level: {type: String},
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
    roomNumber: {type: String},
    status: {
      default: Status.pending,
      enum: Status,
      type: String,
    },
    studentType: {type: String}
  },
  { timestamps: true },
);

const Transaction = model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
