import type { ITransaction } from "#interface/transaction.js";
import type { Request, Response } from "express";

import logger from "#config/logger.js";
import { DueType } from "#interface/due-type";
import { Role } from "#interface/role";
import { IUser } from "#interface/user";
import Transaction from "#models/transaction.model.js";
import User from "#models/user.model";
import { transactionSchema } from "#schemas/transaction.schema.js";
import generatePaymentReference from "#utils/generate-payment-reference.js";
import { JwtPayload } from "#utils/token";
import { FilterQuery } from "mongoose";

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

    if (transactions.length === 0) {
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



export const updateTransactionStatus = async (req: Request, res: Response) => {
  logger.warn("Update transaction status controller");
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id }).exec();
    console.log(transaction)
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

export const getTransactionsByDueType = async (req: Request, res: Response) => {
  logger.warn("Get transactions by due type controller");
  try {
    const { dueType } = req.params;

    if (!Object.values(DueType).includes(dueType as DueType)) {
      return res.status(400).json({
        message: "Invalid  due type provided",
        success: false,
      });
    }

    const transactions = await Transaction.find({ dueType }).exec();
    if (transactions.length === 0) {
      logger.warn(`No transactions found for due type: ${dueType}`);
      return res.status(200).json({
        data: [],
        message: `No transactions found for due type: ${dueType}`,
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
      logger.error("An error occured while fetching transactions by due type", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while fetching transactions by due type", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occured while fetching transactions by due type",
      success: false,
    });
  }
};

export const getAdminTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      logger.warn("Unauthorized access");
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const id = (req.user as JwtPayload & { id: string }).id;

    const admin = await User.findById<IUser>(id).lean<IUser>().exec();

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    if (admin.role !== Role.admin) {
      return res.status(403).json({
        message: "Unauthorized to view transactions",
        success: false,
      });
    }

  
    const filter: FilterQuery<ITransaction> = {};

    switch (admin.dueType) {
      case DueType.college:
          filter.college = admin.college;
        break;
      case DueType.department:
        filter.department = admin.department;
        break;
      case DueType.hostel:
        filter.dueType = "hostel";
        break;
      case DueType.sug:
        filter.dueType = "sug";
        break;
      default:
        logger.error("Unsupported due type");
        throw new Error("Unsupported due type");
    }

    const transactions = await Transaction.find(filter).lean();

    return res.status(200).json({
      data: transactions,
      message: `Transactions fetched for due type: ${admin.dueType}`,
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occured while fetching admin transactions", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while fetching admin transactions", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occured while fetching admin transactions",
      success: false,
    });
  }
};
