import axios from "axios";
import querystring from "querystring";
import { DASHBOARD_URL, NODE_ENV } from "../config/env/env.js";
import { Response, Request, NextFunction } from "express";
import { Locals } from "../utils/express/index.js";
import spotify_session_model from "../models/spotify.model.js";
import { SPOTIFY_CLIENT_ID, SPOTIFY_URI, SPOTIFY_API_URL, SPOTIFY_TOKEN_URL, SPOTIFY_AUTH_URL } from "../config/env/env.spotify.js";
import { SpotifyAccessTokenReq, SpotifyURLAuthParams } from "../types/spotify.types.js";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/spotify.pkce.js";
import { spotifyRefreshAccessToken } from "../utils/refresh.spotify.token.js";


// get the user to login to spotify
const spotifyLogin = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => { // redirect to spotify auth page
    try {
        const user = res.locals.user; // get logged in user from locals
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const codeVerifier = generateCodeVerifier(); // `S256` code challenge method
        const codeChallenge = generateCodeChallenge(codeVerifier); // verify code challenge

        res.cookie("spotify_code_verifier", codeVerifier, { // set cookie
            httpOnly: true,
            secure: NODE_ENV === "production",
            maxAge: 10 * 60 * 1000,
            sameSite: "lax",
            signed: true
        });

        // Store user ID in session cookie for callback to use
        res.cookie("spotify_user_id", user._id.toString(), {
            httpOnly: true,
            secure: NODE_ENV === "production",
            maxAge: 10 * 60 * 1000,
            sameSite: "lax",
            signed: true
        });

        const scopes = [ // scopes for spotify auth
            "user-read-email",
            "playlist-read-private",
            "playlist-modify-private",
            "playlist-modify-public"
        ].join(" ");

        const params = { // params for spotify auth url
            response_type: "code",
            client_id: SPOTIFY_CLIENT_ID,
            scope: scopes,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            redirect_uri: SPOTIFY_URI

        } as SpotifyURLAuthParams; 

        const parse = querystring.stringify(params); // stringify params

        const spotify_OAuth_URL = `${SPOTIFY_AUTH_URL}${parse}`; // spotify auth url

        res.redirect(spotify_OAuth_URL); // redirect to spotify auth url

    } catch (error) {
        next(error);
    }
}

const callback = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => { // spotify callback to
    // get the access token and refresh token

    try {
        const codeVerifier = req.signedCookies.spotify_code_verifier; // get code verifier from cookie
        const userId = req.signedCookies.spotify_user_id; // get user ID from cookie (stored during login)

        const code = req.query.code; // get code from query params

        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID not found, please login again" });
        }

        const params = { // params for spotify token request
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: "authorization_code",
            code,
            redirect_uri: SPOTIFY_URI,
            code_verifier: codeVerifier
        } as SpotifyAccessTokenReq

        const authorisation = querystring.stringify(params);

        const response = await axios.post(SPOTIFY_TOKEN_URL, authorisation, { // post request to spotify token url
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const { access_token, refresh_token, expires_in } = response.data; // destructure to access token and refresh token

        res.clearCookie("spotify_code_verifier");
        res.clearCookie("spotify_user_id");


        const spotify_user = await axios.get(SPOTIFY_API_URL, { // get request to spotify api to get user info
            headers: {
                "Authorization": "Bearer " + access_token
            }
        });

        const spotify_user_id = spotify_user.data.id; // get spotify user id
        const username = spotify_user.data.display_name; // get spotify username

        const expires = new Date(Date.now() + expires_in * 1000); // calculate expiry date

        await spotify_session_model.findOneAndUpdate({ // upsert spotify session in db
            userId: userId,
        },
            {
                spotifyUserId: spotify_user_id,
                username: username,
                access_token: access_token,
                refresh_token: refresh_token,
                expires_in: expires
            }, { upsert: true, new: true });

        res.redirect(DASHBOARD_URL); // redirect to dashboard

    } catch (error) {
        next(error);
    }
}

const spotifyRefreshToken = async (req: Request, res: Response<unknown, Locals>, next: NextFunction) => { // refresh spotify access token

    try {
        const userId = res.locals.user.id; // get logged in user id from locals
        const getToken = await spotifyRefreshAccessToken(userId); // refresh spotify access token

        res.status(200).json({ success: true, message: "refreshed spotify access token", tokens: getToken });
    } catch (error) {
        next(error);
    }
}

export { spotifyLogin, callback, spotifyRefreshToken };