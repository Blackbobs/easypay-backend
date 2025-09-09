import type { ITransaction } from "#interface/transaction.js";
import type { Request, Response } from "express";

import logger from "#config/logger.js";
import { DueType } from "#interface/due-type.js";
import { Role } from "#interface/role.js";
import { IUser } from "#interface/user.js";
import Transaction from "#models/transaction.model.js";
import User from "#models/user.model.js";
import { transactionSchema } from "#schemas/transaction.schema.js";
import generatePaymentReference from "#utils/generate-payment-reference.js";
import { JwtPayload } from "#utils/token.js";
import { UpdateTransactionBody, UpdateTransactionParams } from "dto/transaction.dto.js";
import { FilterQuery } from "mongoose";

export const createTransaction = async (req: Request, res: Response) => {
  logger.info("Create transaction controller");
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
  logger.info("Fetch all transactions controller");
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

export const getRecentTransactions = async (req: Request, res: Response) => {
  logger.info("Get recent transaction controller");
  try {
    const limit = Number(req.query.limit) || 10;

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("email amount status dueType proofUrl createdAt")
      .lean();

    if (transactions.length === 0) {
      logger.warn("No recent transactions found");
      return res.status(200).json({
        data: [],
        message: "No recent transactions found",
        success: false,
      });
    }

    return res.status(200).json({
      data: transactions,
      message: "Recent transactions fetched successfully",
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occured while trying to fetch the recent transactions", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while trying to fetch the recent transactions", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occured while trying to fetch  the recent transactions",
      success: false,
    });
  }
};

export const updateTransactionStatus = async (req: Request<UpdateTransactionParams, unknown, UpdateTransactionBody>, res: Response) => {
  logger.info("Update transaction status controller");
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      logger.warn("Transaction ID is required");
      return res.status(400).json({
        message: "Transaction ID is required",
        success: false,
      });
    }

    if (!status) {
      logger.warn("Status is required");
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }
    const transaction = await Transaction.findByIdAndUpdate<ITransaction>(id, { status }, { new: true });

    if (!transaction) {
      logger.warn("Transaction not found");
      return res.status(400).json({
        message: "Transaction not found",
        success: false,
      });
    }

    logger.info(`Transaction status updated to ${status}`);
    return res.status(200).json({
      data: transaction,
      message: `Transaction status updated to ${status}`,
      success: true,
    });
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
  logger.info("Get transactions by due type controller");
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
  logger.info("Get admin transactions controller");
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
