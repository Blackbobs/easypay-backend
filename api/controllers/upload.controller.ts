import type { Request, Response } from "express";

import cloudinary from "#config/cloudinary.js";
import logger from "#config/logger.js";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Missing Cloudinary environment variables");
}

export const getUploadUrl = (req:Request, res: Response) => {
  try {
    const {folder} = req.query

    const timestamp = Math.round(new Date().getTime() / 1000)

    const signature = cloudinary.utils.api_sign_request(
        { folder: folder ?? "payment_proof", timestamp},
        apiSecret
    )
    res.status(200).json({
      apiKey: apiKey,
      cloudName: cloudName,
      folder,
      signature,
      timestamp
    })
  }catch(error: unknown) {
    if(error instanceof Error) {
      logger.error("Could not generate upload URL", {
        message: error.message,
        stack: error.stack,
      });
    }else{
      logger.error("Could not generate upload url")
    }
    res.status(500).json({
      message: "Could not generate upload URL",
      status: "Failed"
    })
  }
}