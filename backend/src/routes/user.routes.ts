import { Router } from "express";
import { userAccount, deleteAccount, updateProfile, updatePassword } from "../controllers/user.controllers.js";
import { authenticated } from "../middleware/auth.middleware.js";

// User Dashboard & Account Management
const userRouter = Router();

userRouter.get("/me", authenticated, userAccount); // get user account details
userRouter.delete("/delete-account", authenticated, deleteAccount); // delete user account
userRouter.put("/update-profile", authenticated, updateProfile); // update user profile
userRouter.post("/update-password", authenticated, updatePassword); // update user password

export default userRouter;