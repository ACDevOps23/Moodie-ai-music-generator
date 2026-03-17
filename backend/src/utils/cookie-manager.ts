import { Request, Response } from "express"
import { NODE_ENV, COOKIE_NAME, REFRESH_COOKIE_NAME } from "../config/env/env.js";

const isProduction = NODE_ENV === "production";

// Set cookie options
const cookie_manager = (req: Request, res: Response, cookieName: string, token: string, maxAge: any) => {
    return res.cookie(cookieName, token, { // Cookie Options
        httpOnly: true,
        secure: true,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: maxAge,
        path: "/",
        signed: true
    });

}
// Clear cookies
const clearCookies = (req: Request, res: Response, cookieName: string) => { // Cookie Options
    return res.clearCookie(cookieName, {
        httpOnly: true,
        secure: true,
        sameSite: isProduction ? "strict" : "lax",
        path: "/",
        signed: true
    });
}

export { COOKIE_NAME, REFRESH_COOKIE_NAME, cookie_manager, clearCookies };
