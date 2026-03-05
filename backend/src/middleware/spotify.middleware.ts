import spotify_session_model from "../models/spotify.model.js";
import { Response, Request, NextFunction } from "express";
import { Locals } from "../utils/express/index.js";
import { spotifyRefreshAccessToken } from "../utils/refresh.spotify.token.js";

export const spotifyVerified = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => {
// Verify that the user has a valid Spotify session and is logged into the website with Spotify
    const currentDate = new Date();
    try {
        const userId = res.locals.user.id; // Assuming user ID is stored in res.locals.user

        if (!res.locals.user) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        let token = await spotify_session_model.findOne({ userId }); // Fetch Spotify session from DB

       // auto refresh spotify token for authentication if expired
        if (!token.access_token || token.expires_in <= currentDate) {
            const refreshed = await spotifyRefreshAccessToken(userId);
            token.access_token = refreshed.access_token;
            token.refresh_token = refreshed.refresh_token;
            token.save();
        }

        req.spotify_user = { // Attach Spotify user info to request object
            id: token.spotifyUserId,
            username: token.username,
            access_token: token.access_token,
            refresh_token: token.refresh_token
        };

        next();

    } catch (error) {
        next(error);
    }
}