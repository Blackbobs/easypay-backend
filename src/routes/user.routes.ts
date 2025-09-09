import { createUser, deleteUser, forgetPassword, loginUser, resetPassword } from "#controllers/user.controller";
import { authMiddleware } from "#middlewares/auth.middleware";
import { Router } from "express";

const userRouter = Router()

userRouter.post("/", createUser)
userRouter.post("/signin", loginUser)
userRouter.post('/forget-password', authMiddleware, forgetPassword)
userRouter.post("reset-password", authMiddleware, resetPassword)
userRouter.delete("/:id",authMiddleware, deleteUser)

export default userRouter    