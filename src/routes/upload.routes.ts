import { getUploadUrl } from "#controllers/upload.controller.js";
import { Router } from "express";

const uploadRouter = Router()

uploadRouter.get('/upload', getUploadUrl)

export default uploadRouter