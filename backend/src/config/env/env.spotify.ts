// env for spotify

import { config } from "dotenv";
// load environment variables from .env file based on the current NODE_ENV
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` }); 
export const { SPOTIFY_ENDPOINT, SPOTIFY_URI, SPOTIFY_CLIENT_ID, 
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_ENCRYPTION_SECRET,
    SPOTIFY_SEARCH_API,
    SPOTIFY_PLAYLIST_API,
    SPOTIFY_TOKEN_URL,
    SPOTIFY_API_PORT,
    SPOTIFY_API_URL,
    SPOTIFY_AUTH_URL,
    CORS_ORIGIN
} = process.env; // export spotify-related environment variables