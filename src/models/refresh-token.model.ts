import type { IRefreshToken } from "#interface/refresh-token.js";

import { model, Schema } from "mongoose";

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    expiresAt: { index: { expires: "7d" }, required: true, type: Date },
    revoked: {
      default: false,
      type: Boolean,
    },
    token: {
      required: true,
      type: String,
      unique: true,
    },
    user: {
      ref: "Admins",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
