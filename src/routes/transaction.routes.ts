import {
  createTransaction,
  deleteTransaction,
  getAdminSuccessfulTransactions,
  getAdminTransactions,
  getAllTransactions,
  getRecentTransactions,
  getTransactionById,
  updateTransactionStatus,
} from "#controllers/transaction.controller.js";
import { authMiddleware } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const transactionRouter = Router();

transactionRouter.post("/", createTransaction);
transactionRouter.get("/", authMiddleware, getAllTransactions);
transactionRouter.get("/recent", authMiddleware, getRecentTransactions);
transactionRouter.get("/admin", authMiddleware, getAdminTransactions);
transactionRouter.get("/admin/success", authMiddleware, getAdminSuccessfulTransactions);
transactionRouter.get("/:id", authMiddleware, getTransactionById);
transactionRouter.patch("/:id", authMiddleware, updateTransactionStatus);
transactionRouter.delete("/:id", authMiddleware, deleteTransaction);

export default transactionRouter;
