import type { ITransaction } from "#interface/transaction.js";
import type { Request, Response } from "express";

import logger from "#config/logger.js";
import Transaction from "#models/transaction.model.js";
import { transactionSchema } from "#schemas/transaction.schema.js";
import generatePaymentReference from "#utils/generate-payment-reference.js";

export const createTransaction = async (req: Request, res: Response) => {
  logger.warn("Create transaction controller");
  try {
    const value = (await transactionSchema.validateAsync(req.body)) as ITransaction;

    const deaprtmentCode = value.matricNumber.slice(0, 3) || "GEN";
    const reference = generatePaymentReference(deaprtmentCode);

    const newTransaction = await Transaction.create({
      ...value,
      reference,
      status: "pending",
    });

    res.status(201).json({
      data: newTransaction,
      message: "Transaction created successfully",
      status: "Success",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to create a transaction", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to create a transaction", { error: String(error) });
    }

    res.status(500).json({
      message: "Unable to create a transaction",
      status: "Failed",
    });
    return;
  }
};

export const getAllTransactions = async (_req: Request, res: Response) => {
  logger.warn("Fetch all transactions controller");
  try {
    const transactions = await Transaction.find().exec();

    if (!transactions) {
      logger.warn("No transaction available");
      return res.status(200).json({
        data: [],
        message: "No transaction available",
        success: false,
      });
    }

    return res.status(200).json({
      data: transactions,
      message: "Transactions fetched successfully",
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occured while trying to fetch all transactions", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while trying to fetch all transactions", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occured while trying to fetch all transactions",
      success: false,
    });
  }
};

export const getTransactionsByCategory = async (req: Request, res: Response) => {
  logger.warn("Get transaction for each category");
  try {
    const { category } = req.params;
    const transactions = Transaction.find({}).exce();
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occured while trying to fetch transactions for category", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while trying to fetch transactions for category");
    }
    return res.status(500).json({
      message: "An error occured while trying to fetch transactions for category",
      success: false,
    });
  }
};

export const updateTransactionStatus = async (req: Request, res: Response) => {
  logger.warn("Update transaction status controller");
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id }).exce();
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occured while updating transaction status", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while updating transaction status", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occured while updating transaction status",
      success: false,
    });
  }
};
