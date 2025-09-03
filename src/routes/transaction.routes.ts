import { createTransaction } from "#controllers/transaction.controller.js";
import { Router } from "express";

const transactionRouter = Router()

transactionRouter.post("/", createTransaction)

export default transactionRouter