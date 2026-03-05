import axios from "axios";
import querystring from "querystring";
import { SPOTIFY_CLIENT_ID, SPOTIFY_TOKEN_URL } from "../config/env/env.spotify.js";
import spotify_session_model from "../models/spotify.model.js";

// Refresh Spotify Access Token using the stored refresh token for a given user ID. 
// This function retrieves the current refresh token from the database, makes a request to Spotify's token endpoint 
// to get a new access token (and potentially a new refresh token), updates the database with the new tokens and expiration time,
//  and returns the updated tokens. If the refresh token is expired or revoked, it deletes the stored session and prompts the user to re-authenticate.
export const spotifyRefreshAccessToken = async (userId: string) => {

    const get_access_token = await spotify_session_model.findOne({ userId }); // retrieve user spotify session token

    if (!get_access_token?.refresh_token) {
        throw new Error("No refresh token found.");
    }

    const params = { // set up params for refresh token request
        grant_type: "refresh_token",
        refresh_token: get_access_token.refresh_token,
        client_id: SPOTIFY_CLIENT_ID
    }

    const reqRefreshToken = querystring.stringify(params);

    try {
        const response = await axios.post(SPOTIFY_TOKEN_URL, reqRefreshToken, { // make request for new access token
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });

        const { access_token, refresh_token, expires_in } = response.data; // new access and refresh tokens

        const expires = new Date(Date.now() + expires_in * 1000);

        const spotify_user_access = await spotify_session_model.findOneAndUpdate( // update stored tokens
            { userId },
            {
                access_token: access_token || get_access_token.access_token,
                refresh_token: refresh_token || get_access_token.refresh_token,
                expires_in: expires
            }, { upsert: true, new: true });

        return { // return updated tokens to spotify user
            id: spotify_user_access.spotifyUserId,
            access_token: spotify_user_access.access_token,
            refresh_token: spotify_user_access.refresh_token
        }

    } catch (error) {
        if (axios.isAxiosError(error)) { // check if error is from axios
            if (error.response?.status === 400 || error.response?.status === 401) {
                // Refresh token expired or revoked — delete stored session
                await spotify_session_model.deleteOne({ userId }); // delete expired spotify session
                throw new Error("Spotify refresh token expired or revoked. Please re-authenticate.");
            }
        }
        throw error;
    }

}