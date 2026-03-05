import { Router } from "express";
import {signUp, login, logout, refresh} from "../controllers/auth.controller.js";
import {spotifyLogin, callback, spotifyRefreshToken } from "../controllers/spotify.auth.controller.js"
import { validator, signUpValidator, loginValidator } from "../utils/validator.js";
import { authenticated } from "../middleware/auth.middleware.js";

// api routes
const authRouter = Router();

// web user authentication
authRouter.post("/refresh", refresh); // refresh web token
authRouter.post("/sign-up", validator(signUpValidator), signUp); // user sign up
authRouter.post("/login", validator(loginValidator), login); // user login
authRouter.post("/logout", logout); // user logout

// spotify user authentication
authRouter.get("/spotify/refresh_token", authenticated, spotifyRefreshToken); // refresh spotify token
authRouter.get("/spotify/login", authenticated, spotifyLogin); // spotify login
authRouter.get("/spotify/callback", callback); // spotify callback - no auth required, uses stored user ID


export default authRouter;