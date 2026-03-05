import { Document } from "mongoose";
import jwt from "jsonwebtoken";
import "express";

// User Account Interface
export interface IUserAccount extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  refresh_token: string,
  token_expires: Date,
}
// JWT Authentication Argument Interface
export interface JwtAuthArg extends jwt.JwtPayload {
  id: string
}
