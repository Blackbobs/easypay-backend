import { refreshTokenController } from "#controllers/refreshToken.controller.js";
import { createUser, deleteUser, forgetPassword, getCurrentUser, loginUser, logoutController, resetPassword } from "#controllers/user.controller.js";
import { authMiddleware } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.post("/", createUser);
userRouter.post("/signin", loginUser);
userRouter.post("/logout", authMiddleware, logoutController);
userRouter.post("/forget-password", authMiddleware, forgetPassword);
userRouter.post("reset-password", authMiddleware, resetPassword);
userRouter.post("/refresh", refreshTokenController);
userRouter.delete("/:id", authMiddleware, deleteUser);

export default userRouter;
