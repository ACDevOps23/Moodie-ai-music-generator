import { Router } from "express";
import { authenticated } from "../middleware/auth.middleware.js";
import { spotifyVerified } from "../middleware/spotify.middleware.js"
import {
    createPlaylist,
    addSongs,
    myPlaylist,
    updatePlaylist,
    deletePlaylist,
    deleteSongs,
    userStatus,
    getAllPlaylists,
    getPlaylistImages

} from "../services/spotify.services.js"

// Spotify Playlist Management

const spotifyRouter = Router();

spotifyRouter.post("/create-playlist", authenticated, spotifyVerified, createPlaylist); // create a new playlist
spotifyRouter.post("/add-songs", authenticated, spotifyVerified, addSongs); // add songs to a playlist
spotifyRouter.get("/playlists", authenticated, spotifyVerified, getAllPlaylists); // get all user's playlists
spotifyRouter.get("/playlist/:playlistId/images", authenticated, spotifyVerified, getPlaylistImages); // get playlist images
spotifyRouter.post("/my-playlists", authenticated, spotifyVerified, myPlaylist) // get specific playlist details
spotifyRouter.put("/update-playlist", authenticated, spotifyVerified, updatePlaylist); // update playlist details
spotifyRouter.delete("/delete-playlist", authenticated, spotifyVerified, deletePlaylist); // delete a playlist
spotifyRouter.post("/delete-playlist-song", authenticated, spotifyVerified, deleteSongs); // delete songs from a playlist
spotifyRouter.get("/status", authenticated, spotifyVerified, userStatus); // check spotify connection status

export default spotifyRouter;