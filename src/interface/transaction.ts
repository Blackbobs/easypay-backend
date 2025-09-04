import { Document } from "mongoose";

import { Department } from "./deaprtment";
import { DueType } from "./due-type";
import { PaymentMethod } from "./payment-method";
import { Status } from "./status";

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
