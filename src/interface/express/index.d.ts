import type { JwtPayload } from "jsonwebtoken";

import { Role } from "#interface/role";
import { Types } from "mongoose";

interface CustomJwtPayload extends JwtPayload {
  id: Types.ObjectId;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      cookies: {
        accessToken?: string;
        refreshToken?: string;
      };
      user?: CustomJwtPayload;
    }
  }
}
