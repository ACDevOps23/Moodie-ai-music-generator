import { Request, Response, NextFunction } from "express";
import { Locals } from "../utils/express/index.js";
import userAccount_model from "../models/user.account.model.js";
import { clearCookies, COOKIE_NAME, REFRESH_COOKIE_NAME } from "../utils/cookie-manager.js";
import bcrypt from "bcrypt";

export const userAccount = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => { // get user account details
    try {
        const user = res.locals.user; // fetched from auth middleware

        if (!user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        res.locals.user.refresh_token = undefined; // remove jwt token from response

        return res.status(200).json({ success: true, data: user });

    } catch (error) {
        next(error);
    }

}

export const deleteAccount = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => { // delete user account
    try {
        const user = res.locals.user; // fetched from auth middleware

        if (!user) {
            return res.status(401).json({ success: false, message: "User not not logged in" });
        }

        const deletedUser = await userAccount_model.findByIdAndDelete(user._id); // delete user from database

        if (!deletedUser) {
            return res.status(401).json({ success: false, message: "No user found" });
        }

        clearCookies(req, res, COOKIE_NAME); // clear authentication cookies
        clearCookies(req, res, REFRESH_COOKIE_NAME); // clear refresh token cookies

        return res.status(200).json({ succcess: true, message: "Account successfully deleted" });

    } catch (error) {
        next(error);
    }
}
// update user profile
export const updateProfile = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => {
    try {
        const user = res.locals.user; // fetched from auth middleware

        if (!user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { firstName, lastName, email } = req.body;
        
        const updatedUser = await userAccount_model.findByIdAndUpdate( // update user in database
            user._id,
            {
                ...(firstName && { firstName }),// only update fields that are provided in request body
                ...(lastName && { lastName }),
                ...(email && { email }),
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        updatedUser.refresh_token = undefined;

        return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });

    } catch (error) {
        next(error);
    }
}
// update user password
export const updatePassword = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => {
    try {
        const user = res.locals.user;

        if (!user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        // get current and new password from request body
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" });
        }
        // find user in database to get hashed password
        const userWithPassword = await userAccount_model.findById(user._id);

        if (!userWithPassword) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // compare current password with hashed password in database
        const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }
        // hash new password and update user in database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // update user password in database
        const updatedUser = await userAccount_model.findByIdAndUpdate( // update user in database
            user._id,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // remove jwt token from response
        updatedUser.refresh_token = undefined;

        return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        next(error);
    }
}