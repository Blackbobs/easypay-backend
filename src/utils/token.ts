import type { JwtPayload as DefaultJwtPayload, Secret, SignOptions } from "jsonwebtoken";
import type { Types } from "mongoose";

import { jwtConfig } from "#config/jwt.config.js";
import { Role } from "#interface/role";
import jwt from "jsonwebtoken";

export interface JwtPayload extends DefaultJwtPayload {
  id: Types.ObjectId;
  role: Role;
}

const accessSecret: Secret = jwtConfig.accessSecret as Secret;
const refreshSecret: Secret = jwtConfig.refreshSecret as Secret;

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, accessSecret, {
    expiresIn: jwtConfig.accessExpiry as number | string,
  } as SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: jwtConfig.refreshExpiry as number | string,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, refreshSecret) as JwtPayload;
};
