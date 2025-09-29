import type { Request, Response } from "express";

import logger from "#config/logger.js";
import redis from "#config/redis.js";
import RefreshToken from "#models/refresh-token.model.js";
import User from "#models/user.model.js";
import { loginSchema, userSchema } from "#schemas/user.schema.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "#utils/token.js";
import argon2 from "argon2";
import { ForgetPasswordDto } from "dto/forget-password.js";
import { ResetPasswordDto } from "dto/reset-password.js";
import { loginDto, userDto } from "dto/user.dto.js";
import { Types } from "mongoose";

export const createUser = async (req: Request, res: Response) => {
  logger.info("Create user controller");
  try {
    const value = (await userSchema.validateAsync(req.body)) as userDto;

    // Remeber to check if the logical operator is OR or AND
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      logger.warn("A user with this email already exists");
      return res.status(400).json({
        message: "A user with this email already exists",
        succcess: false,
      });
    }

    // Chnage the algorithm to Argon2
    const hashedPassword = await argon2.hash(value.password);

    const newUser = await User.create({
      ...value,
      password: hashedPassword,
    });

    // Remeber to create a create JWT token for authorization and authentication

    return res.status(201).json({
      data: {
        college: newUser.college,
        department: newUser.department,
        email: newUser.email,
        id: newUser._id,
        username: newUser.username,
      },
      message: "User created successfully",
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to create a new user", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to create a new account", { error: String(error) });
    }
    return res.status(500).json({
      message: `Unable to create a new user:  ${error}`,
      success: false,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  logger.info("Login user controller");
  try {
    const value = (await loginSchema.validateAsync(req.body)) as loginDto;

    const user = await User.findOne({ email: value.email });

    if (!user) {
      logger.warn(`login attempt failed: user not found for ${value.email}`);
      return res.status(404).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isMatch = await argon2.verify(user.password, value.password);
    if (!isMatch) {
      logger.warn(`login attempt failed: invalid credentials for ${value.email}`);
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });
    await RefreshToken.create({
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 1000),
      token: refreshToken,
      user: user._id,
    });

    return res.status(200).json({
      data: {
        college: user.college,
        department: user.department,
        email: user.email,
        id: user._id,
        username: user.username,
      },
      message: "User logged in successfully",
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to login user", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to login user", { error: String(error) });
    }
    return res.status(500).json({
      message: "Unable to login user",
      success: false,
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  logger.info("Get current logged-in user controller");

  try {
    const accessToken = req.cookies.accessToken as string | undefined;

    if (!accessToken) {
      return res.status(401).json({
        message: "Access token missing",
        success: false,
      });
    }

    const decoded = verifyAccessToken(accessToken) as { id: Types.ObjectId; role: string };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      data: {
        college: user.college,
        department: user.department,
        email: user.email,
        id: user._id,
        username: user.username,
      },
      messsage: "Current logged in user fetched successfully",
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to get current user", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to get current user", { error: String(error) });
    }
    return res.status(500).json({
      message: "Unable to get current user",
      success: false,
    });
  }
};

export const forgetPassword = async (req: Request<object, object, ForgetPasswordDto>, res: Response) => {
  logger.info("Forget password controller");
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Forget password: no account found for ${email}`);
      return res.status(404).json({ message: "User not found", success: false });
    }
    // Attach the email to the otp

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, "EX", 60 * 5);

    return res.status(200).json({
      message: `OTP sent to ${email}`,
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("An error occured while trying to forget password", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while trying to forget password");
    }

    return res.status(500).json({
      message: "An error occured while trying to forget password",
      status: false,
    });
  }
};

export const resetPassword = async (req: Request<object, object, ResetPasswordDto>, res: Response) => {
  logger.warn("Reset password controller");
  try {
    const { email, newPassword, otp } = req.body;

    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      logger.warn("Invalid or expired OTP");
      return res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }
    const hashedPassword = await argon2.hash(newPassword);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await redis.del(`otp:${email}`);

    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to reset password, please try again!", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to reset password", {
        error: String(error),
      });
    }
    return res.status(500).json({
      message: "Unable to reset password, please try again!",
      status: false,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  logger.warn("Delete user controller");
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });

    if (!user) {
      logger.warn("No user with this id found");
      return res.status(404).json({
        message: "No user found",
        success: false,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.warn("Unable to delete user", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to delete user", { error: String(error) });
    }
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("An error occured while trying to logout", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("An error occured while trying to logout", { error: String(error) });
    }
    return res.status(500).json({ message: "Failed to log out" });
  }
};
