import type { ITransaction } from "#interface/transaction.js";
import type { Request, Response } from "express";

import logger from "#config/logger.js";
import { DueType } from "#interface/due-type.js";
import { Role } from "#interface/role.js";
import { IUser } from "#interface/user.js";
import Transaction from "#models/transaction.model.js";
import User from "#models/user.model.js";
import { transactionSchema } from "#schemas/transaction.schema.js";
import { formatCurrency } from "#utils/format-currency.js";
import generatePaymentReference from "#utils/generate-payment-reference.js";
import { failedMail, sendMail, sendReceipt } from "#utils/mailer.js";
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

    const formattedAmount = formatCurrency(value.amount);

    await sendMail(
      value.email,
      "Payment Received - EasyPay",
      `
        <h2>Hi ${value.fullName || "User"},</h2>
        <p>Your payment of <b>${formattedAmount} </b> has been received.</p>
        <p>Status: <b>Pending Confirmation</b></p>
        <p>Reference: <b>${reference}</b></p>
        <p>Once confirmed, we will send you your official receipt.</p>
        <br/>
        <p>Thanks,<br/>The EasyPay Team</p>
      `,
    );

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

export const getAllTransactions = async (req: Request, res: Response) => {
  logger.info("Fetch all transactions controller");
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find().sort({ createdAt: -1 }).select("email amount status dueType proofUrl createdAt").skip(skip).limit(limit).lean(),
      Transaction.countDocuments(),
    ]);
    if (transactions.length === 0) {
      logger.warn("No transaction available");
      return res.status(200).json({
        data: [],
        message: "No transaction available",
        meta: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        },
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

export const getTransactionById = async (req: Request, res: Response) => {
  logger.info("Get transaction by id controller");
  try {
    const { id } = req.params;

    if (!id) {
      logger.warn("Transaction ID required");
      return res.status(400).json({
        message: "Transaction ID required",
        success: false,
      });
    }

    const transaction = await Transaction.findById<ITransaction>(id).lean();

    if (!transaction) {
      logger.warn(`Transaction not found with ID: ${id}`);
      return res.status(400).json({
        message: "Transaction not found",
        success: false,
      });
    }

    return res.status(200).json({
      data: transaction,
      message: "Transaction details fetched successfully",
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occured while trying to fetch transaction by id", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while trying to fetch transaction by id", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occured while trying to fetch transaction by id",
      success: false,
    });
  }
};

export const getAdminSuccessfulTransactions = async (req: Request, res: Response) => {
  logger.info("Get admin successful transactions controller");
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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ITransaction> = { status: "successful" };

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

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("email amount status dueType proofUrl createdAt").lean(),
      Transaction.countDocuments(filter),
    ]);

    if (transactions.length === 0) {
      logger.warn(`No successful transactions found for due type: ${admin.dueType}`);
      return res.status(200).json({
        data: [],
        message: `No successful transactions found for due type: ${admin.dueType}`,
        meta: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        },
        success: false,
      });
    }

    return res.status(200).json({
      data: transactions,
      message: `Successful transactions fetched for due type: ${admin.dueType}`,
      meta: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("An error occurred while fetching admin successful transactions", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occurred while fetching admin successful transactions", { error: String(error) });
    }
    return res.status(500).json({
      message: "An error occurred while fetching admin successful transactions",
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

    if (status === "successful") {
      await sendReceipt(transaction.email, transaction);
      logger.info(`Receipt sent to ${transaction.email}`);
    } else if (status === "failed") {
      await failedMail(transaction.email, transaction);
    }
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
