import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express"
import { createToken, removeToken } from "../utils/token.manager.js";
import userAccount_model from "../models/user.account.model.js";
import { COOKIE_NAME, cookie_manager, clearCookies, REFRESH_COOKIE_NAME } from "../utils/cookie-manager.js";
import { TOKEN_DURATIONS } from "../utils/token_expiry.js";
import { refreshWebToken } from "../utils/refresh.web.token.js";

const signUp = async (req: Request, res: Response, next: NextFunction) => { // sign up controller 

    try {
        const { firstName, lastName, email, password } = req.body; // sign up form fields

        const findUser = await userAccount_model.findOne({ email }); // check if user already exists

        if (findUser) { // if user exists, sign in instead
            return res.status(401).json({ message: `An account with ${email} already exists, sign in.` });
        }

        const salt = await bcrypt.genSalt(12); // generate salt for password hashing
        const hash_password = await bcrypt.hash(password, salt); // hash password

        const signedUp_user = new userAccount_model({
            firstName,
            lastName,
            email,
            password: hash_password
        }); // create a new user account instance

        const accessToken = createToken(signedUp_user._id.toString(), signedUp_user.email, "1h"); // create access token for 1 hour
        const refreshToken = createToken(signedUp_user._id.toString(), signedUp_user.email, "7d"); // create refresh token for 7 days
        // hash token
        signedUp_user.refresh_token = await bcrypt.hash(refreshToken, 12); // store refresh token in user account
        await signedUp_user.save();

        cookie_manager(req, res, COOKIE_NAME, accessToken, TOKEN_DURATIONS.ACCESS); // set access token cookie
        cookie_manager(req, res, REFRESH_COOKIE_NAME, refreshToken, TOKEN_DURATIONS.REFRESH); // set refresh token cookie

        signedUp_user.password = undefined; // remove password from response
        signedUp_user.refresh_token = undefined; // remove jwtToken from response

        return res.status(201).json({ success: true, user: signedUp_user }); // respond with created user account

    } catch (error) {
        next(error);
    }
}

const login = async (req: Request, res: Response, next: NextFunction) => { // login controller

    try {
        const { email, password } = req.body; // login form fields

        const user_account = await userAccount_model.findOne({ email }); // find user account by email

        if (!user_account) { // if user account not found, create an account
            return res.status(401).json({ message: `No username registered with ${email}. Create an account.` });
        }

        // If a refresh cookie is present and valid, and it matches the stored token,
        // the user is already logged in — return early.
        const existingRefresh = req.signedCookies[REFRESH_COOKIE_NAME];
        
        if (existingRefresh) {
            try {
                const decoded = removeToken(req, res, existingRefresh);
                const matches = await bcrypt.compare(existingRefresh, user_account.refresh_token);
                if (decoded.id === user_account._id.toString() && matches) { // user_account.jwtToken && user_account.jwtToken === existingRefresh) {
                    user_account.refresh_token = undefined; // don't expose token
                    user_account.password = undefined;
                    return res.status(409).json({ success: true, message: 'User already signed in', user: user_account });
                }
            } catch (err) {
                // invalid/expired token — ignore and continue with login flow
            }
        }

        const isPassword = await bcrypt.compare(password, user_account.password); // compare provided password with stored hashed password

        if (!isPassword) {
            return res.status(403).json({ message: "invalid Password" });
        }

        const accessToken = createToken(user_account._id.toString(), user_account.email, "1h"); // create access token for 1 hour
        const refreshToken = createToken(user_account._id.toString(), user_account.email, "7d"); // create refresh token for 7 days
        // hash token
        user_account.refresh_token = await bcrypt.hash(refreshToken, 12); // store refresh token in user account
        await user_account.save(); // save updated user account

        cookie_manager(req, res, COOKIE_NAME, accessToken, TOKEN_DURATIONS.ACCESS); // set access token cookie
        cookie_manager(req, res, REFRESH_COOKIE_NAME, refreshToken, TOKEN_DURATIONS.REFRESH); // set refresh token cookie

        user_account.refresh_token = undefined; // remove jwtToken from response
        user_account.password = undefined; // remove password from response

        return res.status(200).json({ success: true, user: user_account }); // respond with user account

    } catch (error) {
        next(error);
    }
}

const logout = async (req: Request, res: Response, next: NextFunction) => { // logout controller
    try {
        const token = req.signedCookies[REFRESH_COOKIE_NAME]; // get refresh token from signed cookies

        if (!token) { // if no token found, user is not signed in
            return res.status(400).json({ message: "User not signed in" });
        }

        const decodeToken = removeToken(req, res, token); // decode and remove token
        const user = await userAccount_model.findById(decodeToken.id); // find user by decoded token id

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.refresh_token = null; // clear jwtToken from user account
        await user.save(); // save updated user account

        clearCookies(req, res, COOKIE_NAME); // clear access token cookie
        clearCookies(req, res, REFRESH_COOKIE_NAME); // clear refresh token cookie

        return res.status(200).json({ success: true, message: "successfully logged out" });

    } catch (error) {
        next(error);
    }
}

const refresh = async (req: Request, res: Response, next: NextFunction) => { // refresh web token controller
    try {
        await refreshWebToken(req, res); // refresh web token
        
        // If refreshWebToken already sent a response (error case), don't send another
        if (res.headersSent) {
            return;
        }
        
        return res.status(200).json({ success: true, message: "Web token refreshed!" });
    } catch (error) {
        next(error);
    }
}

export { signUp, login, logout, refresh };