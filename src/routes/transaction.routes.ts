import { createTransaction, getAdminTransactions, getAllTransactions, updateTransactionStatus } from "#controllers/transaction.controller.js";
import { authMiddleware } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const transactionRouter = Router()

transactionRouter.post("/", createTransaction)
transactionRouter.get("/", authMiddleware, getAllTransactions)
transactionRouter.get("/admin", authMiddleware, getAdminTransactions)
transactionRouter.put("/:id", authMiddleware, updateTransactionStatus)

export default transactionRouter