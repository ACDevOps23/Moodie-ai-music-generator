import mongoose from "mongoose";
import { ISpotifySession } from "../types/spotify.types.js";
import { encrypt, decrypt } from "../utils/model-encryption.js";

const spotify_schema = new mongoose.Schema<ISpotifySession>({ // spotify db schema for user sessions
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    spotifyUserId: {
        type: String,
        required: true,
    },
    username: String,
    access_token: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    refresh_token: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    expires_in: {
        type: Date,
        required: true
    },
    playlists: [{
        playlistId: String,
        playlistName: String,
        description: String,
        public: Boolean,
        trackIds: [String]
    }]
},
{ timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
 });

const spotify_session_model = mongoose.model<ISpotifySession>("Spotfiy_user", spotify_schema);
export default spotify_session_model;