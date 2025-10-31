import { refreshTokenController } from "#controllers/refreshToken.controller.js";
import {
  createUser,
  deleteUser,
  forgetPassword,
  getAdminTotalAmount,
  getAllAdmins,
  getCurrentUser,
  loginUser,
  logoutController,
  resetPassword,
  setAdminTotalAmount,
} from "#controllers/user.controller.js";
import { authMiddleware } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.get("/admins", authMiddleware, getAllAdmins);
userRouter.get("/admin/total-amount", authMiddleware, getAdminTotalAmount);
userRouter.post("/", createUser);
userRouter.post("/signin", loginUser);
userRouter.post("/logout", authMiddleware, logoutController);
userRouter.post("/forget-password", authMiddleware, forgetPassword);
userRouter.post("reset-password", authMiddleware, resetPassword);
userRouter.post("/refresh", refreshTokenController);
userRouter.post("/admin/total-amount", authMiddleware, setAdminTotalAmount);
userRouter.delete("/:id", authMiddleware, deleteUser);

export default userRouter;
