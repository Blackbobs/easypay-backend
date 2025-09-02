import type { ITransaction } from "#interface/transaction.js";
import type { Request, Response } from "express";

import logger from "#config/logger.js";
import Transaction from "#models/transaction.model.js";
import { transactionSchema } from "#schemas/transaction.schema.js";
import generatePaymentReference from "#utils/generate-payment-reference.js";

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const value = (await transactionSchema.validateAsync(req.body)) as ITransaction

        const deaprtmentCode = value.matricNumber?.slice(0,3) || "GEN"
        const reference = generatePaymentReference(deaprtmentCode)

        const newTransaction = await Transaction.create({
          ...value,
          reference,
          status: "pending"
        })

        res.status(201).json({
          data: newTransaction,
          message: "Transaction created successfully",
          status: "Success"
        })

        
    }catch (error: unknown) {
        if (error instanceof Error) {
          logger.error("Unable to fetch admins", {
            message: error.message,
            stack: error.stack,
          });
        } else {
          logger.error("Unable to fetch admins", { error: String(error) });
        }
    
        res.status(500).json({
          message: "Unable to fetch admins",
          status: "Failed",
        });
        return;
      }
}