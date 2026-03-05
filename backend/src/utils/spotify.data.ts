import { Response, Request, NextFunction } from "express";
import axios from "axios";
import spotify_session_model from "../models/spotify.model.js";

// Generic function to call Spotify API with proper headers
let callSpotifyAPI = async (req: Request, func: any, endpoint: string, options: { params?: any; data?: any; } = {}) => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + req.spotify_user.access_token
        },
        ...options
    };

    if (func === axios.get) { // `get` and `delete` requests don't have a body
        return await func(endpoint, config); // GET/DELETE use config (query params go in config.params)
    } else { // `post` and `put` requests have a body
        return await func(endpoint, options.data, config); // POST/PUT/DELETE use (url, data, config)
    }
};

// Function to retrieve playlist data for a given Spotify user and playlist name
const playlistData = async (res: Response, spotifyUserId: any, playlistName: string) => {

    const playlist = await spotify_session_model.findOne({ spotifyUserId });
     if (!playlist) res.status(404).json({ error: "User session not found" });
    const matchedPlaylist = playlist.playlists.find(p => p.playlistName.toLowerCase() === playlistName.toLowerCase());

    return matchedPlaylist;
}

export { callSpotifyAPI, playlistData };