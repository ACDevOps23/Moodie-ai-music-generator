import { Request, Response, NextFunction } from "express";
import { Locals } from "../utils/express/index.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env/env.js";
import userAccount_model from "../models/user.account.model.js";
import { JwtAuthArg } from "../types/user.types.js";
import { refreshWebToken } from "../utils/refresh.web.token.js";

export const authenticated = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => {
  let decoded: JwtAuthArg;
  const currentDate = new Date();

  let jwtToken = req.signedCookies.jwt || req.headers.authorization?.split(" ")[1]; // Bearer token

  try {
    decoded = jwt.verify(jwtToken, JWT_SECRET) as JwtAuthArg; // Verify token
    const user = await userAccount_model.findById(decoded.id).select("-password"); // Fetch user without password

    if (!user) { return res.status(401).json({ message: "User not found" }); }
    res.locals.user = user; // Attach user to response locals
    next(); // Proceed to next middleware or route handler
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      try { // Try to refresh token
        jwtToken = await refreshWebToken(req, res, true);
        decoded = jwt.verify(jwtToken, JWT_SECRET) as JwtAuthArg; // Verify token
        const user = await userAccount_model.findById(decoded.id).select("-password"); // Fetch user without password
        if (!user) { return res.status(401).json({ message: "User not found" }); }
    
        res.locals.user = user; // Attach user to response locals
        next(); // Proceed to next middleware or route handler
      } catch (error) {
        return res.status(401).json({ message: "Invalid Token!" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorised, login!" });
    }
  }
}