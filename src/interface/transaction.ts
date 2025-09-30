import { Document } from "mongoose";

import { Department } from "./deaprtment.js";
import { DueType } from "./due-type.js";
import { PaymentMethod } from "./payment-method.js";
import { Status } from "./status.js";

export interface ITransaction extends Document {
  amount?: number;
  college: string;
  createdAt: Date;
  department?: Department;
  dueType: DueType;
  email: string;
  fullName: string;
  hostel?: string;
  level?: string;
  matricNumber: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  proofUrl: string;
  receiptName?: string;
  reference: string;
  roomNumber?: string;
  status: Status;
  studentType?: string;
  updatedAt: Date;
}
