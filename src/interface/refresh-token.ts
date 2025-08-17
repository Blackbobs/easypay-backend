import type { Types } from "mongoose";

export interface IRefreshToken extends Document {
    createdAt: Date;               
    expiresAt: Date;              
    revoked?: boolean;             
    token: string;                
    user: Types.ObjectId;        
  }