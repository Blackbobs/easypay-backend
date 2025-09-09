import { createUser, deleteUser, forgetPassword, loginUser, resetPassword } from "#controllers/user.controller.js";
import { authMiddleware } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const userRouter = Router()

userRouter.post("/", createUser)
userRouter.post("/signin", loginUser)
userRouter.post('/forget-password', authMiddleware, forgetPassword)
userRouter.post("reset-password", authMiddleware, resetPassword)
userRouter.delete("/:id",authMiddleware, deleteUser)

export default userRouter    