import { Document } from "mongoose";

import { Department } from "./deaprtment.js";
import { DueType } from "./due-type.js";
import { PaymentMethod } from "./payment-method.js";
import { Status } from "./status.js";

export interface ITransaction extends Document {
  amount: number;
  bank: string;
  college: string;
  createdAt: Date;
  department: Department;
  dueType: DueType;
  email: string;
  fullName: string;
  matricNumber: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  proofUrl: string;
  reference: string;
  status: Status;
  updatedAt: Date;
}
