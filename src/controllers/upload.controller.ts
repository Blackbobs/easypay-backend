import type { Request, Response } from "express";

import logger from "#config/logger.js";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export const getUploadUrl = async (req:Request, res: Response) => {
  try {
    const {folder} = req.query

    const timestamp = Math.round(new Date().getTime() / 1000)

    const signature = cloudinary.utils.api_sign_request(
        {timestamp, folder: folder || "payment_proof"},
        process.env.CLOUDINARY_API_SECRET
    )
  }catch(error: unknown) {
    if(error instanceof Error) {
      logger.error("Unable to fetch admins", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}