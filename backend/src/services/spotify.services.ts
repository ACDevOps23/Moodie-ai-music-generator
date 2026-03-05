
import { Response, Request, NextFunction } from "express";
import { SPOTIFY_API_URL, SPOTIFY_ENDPOINT, SPOTIFY_PLAYLIST_API, SPOTIFY_SEARCH_API } from "../config/env/env.spotify.js";
import { callSpotifyAPI, playlistData } from "../utils/spotify.data.js";
import axios from "axios";
import spotify_session_model from "../models/spotify.model.js";

// create playlist
const createPlaylist = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const spotifyUserId = req.spotify_user.id; // get spotify user id from middleware
        const { playlistName, description } = req.body; // get playlist name and description from request body
        const createPlaylistAPI = `${SPOTIFY_ENDPOINT}/users/${spotifyUserId}/playlists`; // spotify create playlist endpoint
        // test if playlist is private
        const params = { // request body params
            "name": playlistName,
            "description": description,
            "public": false
        }
        // call spotify api to create playlist
        const playlist = await callSpotifyAPI(req, axios.post, createPlaylistAPI, { data: params });

        // update playlist info to mongoDB
        await spotify_session_model.findOneAndUpdate({ spotifyUserId },
            {
                $push: {
                    playlists: {
                        playlistId: playlist.data.id,
                        playlistName: playlist.data.name,
                        description: playlist.data.description,
                        public: playlist.data.public,
                        trackIds: [],
                    }
                }
            }, { new: true, upsert: true }); // upsert: create new document if not exist

        return {
            success: true,
            message: "Spotify playlist created!"
        } 

    } catch (error) {
        next(error);
    }
}


// add songs to playlist
const addSongs = async (req: Request, res: Response, next: NextFunction) => {

    const spotifyUserId = req.spotify_user.id;

    const uris = new Set<string> ; // to store matched song URIs
    const trackNames: string[] = req.body.trackNames; // array of track names from request body
    const playlistName: string = req.body.playlistName; // playlist name from request body
    const artistName: string[] = req.body.artistName; // array of artist names from request body

    for (const song of trackNames) { // loop through each track name
        for (const artist of artistName) { // loop through each artist name
            const query = `track:${song} artist:${artist}`; // construct search query

            try { // search for track on spotify
                const params = {
                    q: query,
                    type: "track",
                    limit: 1
                }
                // call spotify api to search for track
                const getSongs = await callSpotifyAPI(req, axios.get, SPOTIFY_SEARCH_API, { params: params });

                // find the exact match for both song and artist
                const songsMatched = getSongs.data.tracks.items;
                const matchedArtist = songsMatched.find((a: any) => a.artists.some((a: any) => a.name.toLowerCase() === artist.toLowerCase()));

                if (matchedArtist) { // if match found, push the URI to songs_id array
                    uris.add(matchedArtist.uri);
                }

            } catch (error) {
                console.error(`Error searching for track: ${song}`, error);
            }
        }

    }
    const songs_id = [...uris];
    
    // Update MongoDB with new track URIs - fix positional operator issue
    try {
        if (songs_id.length > 0) {
            const session = await spotify_session_model.findOne({ spotifyUserId });
            if (session) {
                const playlistIndex = session.playlists.findIndex((p: any) => p.playlistName === playlistName);
                if (playlistIndex !== -1) {
                    session.playlists[playlistIndex].trackIds.push(...songs_id);
                    await session.save();
                }
            }
        }
    } catch (dbError) {
        console.error("Error updating playlist in DB:", dbError);
    }

    try {
        const matchedPlaylist = await playlistData(res, spotifyUserId, playlistName);

        if (!matchedPlaylist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        const params = {
            uris: songs_id
        }
        const postToPlaylist = `${SPOTIFY_PLAYLIST_API}/${matchedPlaylist.playlistId}/tracks`;

        await callSpotifyAPI(req, axios.post, postToPlaylist, { data: params });

    } catch (error) {
        next(error);
    }
}



// get my playlist details
const myPlaylist = async (req: Request, res: Response, next: NextFunction) => {

    const playlistName = req.body.playlistName;
    const myPlaylist = await playlistData(res, req.spotify_user.id, playlistName);

    try {
        const getPlaylist = await callSpotifyAPI(req, axios.get, `${SPOTIFY_PLAYLIST_API}/${myPlaylist.playlistId}`);

        const get_artists = getPlaylist.data.tracks.items.flatMap((a: any) => a.track.artists.map((artist: any) => artist.name));
        const artists = get_artists.filter((item: any, index: any) => get_artists.indexOf(item) === index);

        const getMyplaylist = {
            name: myPlaylist.playlistName,
            description: myPlaylist.description,
            url: getPlaylist.data.external_urls,
            album: getPlaylist.data.tracks.items[0].track.album.name,
            track_name: getPlaylist.data.tracks.items.map((track: any) => track.track.name),
            artist_name: artists.join(", "),
            img_url: getPlaylist.data.images[0].url
        }

        return res.status(200).json({ success: true, playlist: getMyplaylist });


    } catch (error) {
        console.error("cannot get playlist");
        next(error);
    }

}
// update playlist details
const updatePlaylist = async (req: Request, res: Response, next: NextFunction) => {
   
    const { playlistName, name, description } = req.body;
    const myPlaylist = await playlistData(res, req.spotify_user.id, playlistName);

    const params = {
        name: name || myPlaylist.playlistName,
        description: description || myPlaylist.description,
        public: false
    }

    try {

        await callSpotifyAPI(req, axios.put, `${SPOTIFY_PLAYLIST_API}/${myPlaylist.playlistId}`, { data: params });

        // update playlist info in mongoDB
        await spotify_session_model.findOneAndUpdate(
            { spotifyUserId: req.spotify_user.id, "playlists.playlistName": playlistName },
            {
                $set: {
                    "playlists.$.playlistName": params.name,
                    "playlists.$.description": params.description
                }
            },
            { new: true }
        );

        res.status(201).json({ success: true, message: "updated playlist" });

    } catch (error) {
        console.error("cannot update playlist name");
        next(error);
    }

}

// delete playlist
const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  
    const playlistName = req.body.playlistName;
    const myPlaylist = await playlistData(res, req.spotify_user.id, playlistName);


    if (!myPlaylist) {
        return res.status(404).json({ success: false, message: "Playlist not found in DB." });
    }

    try {

        await callSpotifyAPI(req, axios.get, `${SPOTIFY_PLAYLIST_API}/${myPlaylist.playlistId}`);

        // playlist still exits on spotify - delete
        await spotify_session_model.updateOne({ spotifyUserId: req.spotify_user.id },
            { $pull: { playlists: { playlistId: myPlaylist.playlistId } } });

        return res.status(201).json({ success: true, message: "deleted playlist please also delete in your spotify account" });


    } catch (error) {
        if (error.response?.status === 404) {
            // the playlist doesnt exist on spotify - delete
            await spotify_session_model.updateOne({ spotifyUserId: req.spotify_user.id },
                { $pull: { "playlists.playlistId": myPlaylist.playlistId } }
            );
            return res.status(201).json({ success: true, message: "deleted playlist" });

        }
    }
}

// delete songs from playlist
const deleteSongs = async (req: Request, res: Response, next: NextFunction) => {

    const playlist = await spotify_session_model.findOne({ spotifyUserId: req.spotify_user.id });

    const trackNames: string[] = req.body.trackNames;
    const playlistName = req.body.playlistName;

    const matchPlaylist = playlist.playlists.find(p => p.playlistName.toLowerCase() === playlistName.toLowerCase());
    try {

        const tracks = await axios.get(`${SPOTIFY_PLAYLIST_API}/${matchPlaylist.playlistId}`, {
            headers: {
                Authorization: "Bearer " + req.spotify_user.access_token
            }
        });

        for (const track_name of trackNames) {
            const matchTrack = tracks.data.tracks.items.find((tracks: any) => tracks.track.name.toLowerCase().includes(track_name.toLowerCase()));

            const trackUri = matchTrack.track.uri;

            await axios.delete(`${SPOTIFY_PLAYLIST_API}/${matchPlaylist.playlistId}/tracks`, {
                headers: {
                    Authorization: "Bearer " + req.spotify_user.access_token,
                    "Content-Type": "application/json"
                },
                data: {
                    tracks: [{ uri: trackUri }]
                }
            });

            // update playlist in mongoDB - remove track URI from trackIds array
            await spotify_session_model.updateOne({ spotifyUserId: req.spotify_user.id, "playlists.playlistId": matchPlaylist.playlistId },
                { $pull: { "playlists.$.trackIds": trackUri } }
            );

        }

        return res.status(200).json({ success: true, message: `Deleted ${trackNames} from ${playlistName}` });

    } catch (error) {
        return res.status(404).json({ success: false, message: "couldn't delete song" });
    }

}
// test
const userStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (req.spotify_user) { 
            return res.status(200).json({ 
                success: true, 
                message: "Spotify is connected", 
                username: req.spotify_user.username 
            });
        } else {
            return res.status(401).json({ success: false, message: "log in to spotify" });
        }
    } catch (error) {
        return res.status(503).json({ success: false, message: "couldn't get spotify status" });
    }
}

// Get all user playlists
const getAllPlaylists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const spotifyUserId = req.spotify_user.id;
        
        const spotifySession = await spotify_session_model.findOne({ spotifyUserId });
        
        if (!spotifySession || !spotifySession.playlists) {
            return res.status(200).json({ success: true, playlists: [] });
        }

        // Return all playlists from MongoDB
        return res.status(200).json({ 
            success: true, 
            playlists: spotifySession.playlists
        });

    } catch (error) {
        next(error);
    }
}

// Get playlist images from Spotify
const getPlaylistImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playlistId } = req.params;

        if (!playlistId) {
            return res.status(400).json({ success: false, message: "Playlist ID is required" });
        }

        // Call Spotify API to get playlist images
        const imagesUrl = `${SPOTIFY_PLAYLIST_API}/${playlistId}/images`;
        const images = await callSpotifyAPI(req, axios.get, imagesUrl);

        // Return the images array from Spotify
        return res.status(200).json(images.data || []);

    } catch (error) {
        next(error);
    }
}

export { createPlaylist, addSongs, myPlaylist, updatePlaylist, deletePlaylist, deleteSongs, userStatus, getAllPlaylists, getPlaylistImages };