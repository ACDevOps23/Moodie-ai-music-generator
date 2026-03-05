import { Request, Response } from "express";
import { COOKIE_NAME, REFRESH_COOKIE_NAME } from "./cookie-manager.js";
import { createToken, createRefreshToken, removeToken } from "./token.manager.js";
import userAccount_model from "../models/user.account.model.js";
import { TOKEN_DURATIONS } from "./token_expiry.js";
import { cookie_manager } from "./cookie-manager.js";
import bcrypt from "bcrypt";

// Refreshes the web token for a user when the access token has expired. It checks for the presence of a refresh token, validates it against 
// the stored hashed refresh token in the database, and if valid, generates new access and refresh tokens. The new tokens are then set in cookies,
//  and the user's record in the database is updated with the new hashed refresh token and its expiration time. If any step fails
//  (e.g., no token provided, user not found, invalid token), it returns an appropriate error response or throws an error for internal calls.
export const refreshWebToken = async (req: Request, res: Response, internal = false): Promise<string | any> => {

    const token = req.signedCookies[REFRESH_COOKIE_NAME] || req.headers["x-refresh-token"]; // get current token

    if (!token) {
        if (!internal) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }
        throw new Error("No refresh token provided");
    }

    try {
        const decoded = removeToken(req, res, token); // decode current token 
        const user = await userAccount_model.findById(decoded.id); // find user with the current token
        
        if (!user) {
            if (!internal) {
                return res.status(401).json({ success: false, message: "User not found" });
            }
            throw new Error("User not found");
        }

        const matches = await bcrypt.compare(token, user.refresh_token); // compare
        
        if (!matches) {
            if (!internal) {
                return res.status(403).json({ success: false, message: "Invalid refresh token" });
            }
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = createToken(user._id.toString(), user.email, "1h"); // create new access token
        const newRefreshToken = createRefreshToken(user._id.toString(), user.email, "7d"); // create new refresh token

        cookie_manager(req, res, COOKIE_NAME, newAccessToken, TOKEN_DURATIONS.ACCESS); // set new access token in cookie
        cookie_manager(req, res, REFRESH_COOKIE_NAME, newRefreshToken, TOKEN_DURATIONS.REFRESH); // set new refresh token in cookie
        
        // user.jwtToken = newRefreshToken; // update user with new refresh token
        user.refresh_token = await bcrypt.hash(newRefreshToken, 12); // encrypt 
        user.token_expires = new Date(Date.now() + TOKEN_DURATIONS.REFRESH); // update token expiry
        await user.save(); // save user

        if (internal) { // internal call, return token
            return newAccessToken;
        }

        return newAccessToken;
    } catch (error: any) {
        console.error("Error refreshing web token:", error);
        if (!internal) {
            return res.status(500).json({ success: false, message: error.message || "Failed to refresh token" });
        }
        throw error;
    }
}