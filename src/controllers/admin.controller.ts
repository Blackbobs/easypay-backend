import type { AdminInput } from "#interface/admin.js";
import type { LoginRequest } from "#interface/login.js";
import type { Request, Response } from "express";

import logger from "#config/logger.js";
import Admin from "#models/admin.model.js";
import RefreshToken from "#models/refresh-token.model.js";
import { adminSchema } from "#schemas/admin.schema.js";
import { generateAccessToken, generateRefreshToken } from "#utils/token.js";
import bcrypt from "bcrypt";
import Joi from "joi";

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const value: AdminInput = await adminSchema.validateAsync(req.body);

    const existingAdmin = await Admin.findOne({ email: value.email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "An admin with this email already exists",
        status: "Failed",
      });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newAdmin = await Admin.create({
      ...value,
      password: hashedPassword,
    });

    return res.status(201).json({
      data: {
        department: newAdmin.department,
        email: newAdmin.email,
        id: newAdmin._id,
        role: newAdmin.role,
      },
      message: "Admin created successfully",
      status: "Success",
    });
  } catch (error: unknown) {
    if (error instanceof Joi.ValidationError) {
      return res.status(400).json({
        message: error.message,
        status: "Failed",
      });
    }

    if (error instanceof Error) {
      logger.error("Unable to create an admin account", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to create an admin account", { error: String(error) });
    }

    res.status(500).json({
      message: "Unable to create an admin account",
      status: "Failed",
    });
    return;
  }
};

export const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;

    if (!userId) {
      logger.warn("Unauthorized access: No user ID provided");
      res.status(401).json({
        message: "Unauthorized: User ID missing",
        status: "Failed",
      });
      return;
    }

    const admins = await Admin.find({ role: "admin" });

    if (admins.length === 0) {
      logger.warn("No admins available");
      res.status(200).json({
        data: [],
        message: "No admins available",
        status: "Success",
      });
      return;
    }

    res.status(200).json({
      data: admins,
      message: "Admins retrieved successfully",
      status: "Success",
    });
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to fetch admins", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to fetch admins", { error: String(error) });
    }

    res.status(500).json({
      message: "Unable to fetch admins",
      status: "Failed",
    });
    return;
  }
};

export const loginAdmin = async (req: Request<object, object, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Email and password are required");
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await Admin.findOne({ email });
    if (!user) {
      logger.warn(`⚠️ Login attempt failed: user not found for ${email}`);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`⚠️ Login attempt failed: user not found for ${email}`);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const payload = { email: user.email, id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
    });

    res.status(200).json({
      data: {
        accessToken,
        admin: {
          department: user.department,
          email: user.email,
          id: user._id,
          role: user.role,
        },
        refreshToken,
      },
      message: "Login successful",
      status: "Success",
    });
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to login admin", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to login admin", { error: String(error) });
    }

    res.status(500).json({
      message: "Unable to login admin",
      status: "Failed",
    });
    return;
  }
};
