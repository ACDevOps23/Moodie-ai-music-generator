import { parseUserPrompt } from "../gemini/gemini.parser.js";
import { createPlaylist, addSongs, updatePlaylist, deleteSongs, deletePlaylist } from "../services/spotify.services.js";

// Bridge Controller (middleman controller)
// This controller calls Gemini, takes the JSON result, 
// and "shapes" it to look exactly like a standard request before passing it
//  to your existing logic. - connect gemini to spotify functions
export const geminiHandler = async (req: any, res: any, next: any) => {
    try {
        const { userPrompt } = req.body;

        // get clean data from Gemini
        const intent = await parseUserPrompt(userPrompt);

        // map actions to parse arguments before execution
        switch (intent.action) {
            case "create_playlist":
                req.body.playlistName = intent.playlistName;
                req.body.description = intent.description || "AI Generated!";
                await createPlaylist(req, res, next);

                // If Gemini generated songs, add them
                if (intent.songs && intent.songs.length > 0) {
                    req.body.trackNames = intent.songs.map((s: any) => s.title);
                    req.body.artistName = intent.songs.map((s: any) => s.artist);
                    await addSongs(req, res, next);
                }

                // Only send response if not already sent
                if (!res.headersSent) {
                    return res.status(201).json({
                        success: true,
                        message: "Playlist created and songs added",
                        action: "create_playlist",
                        playlistName: intent.playlistName,
                        description: intent.description || "AI Generated!",
                        songsAdded: intent.songs?.length || 0
                    });
                }
                return;

            case "add_songs":
                req.body.playlistName = intent.playlistName;

                if (intent.songs && intent.songs.length > 0) {
                    req.body.trackNames = intent.songs.map((s: any) => s.title);
                    req.body.artistName = intent.songs.map((s: any) => s.artist);
                    await addSongs(req, res, next);
                }

                return res.status(201).json({
                    success: true,
                    message: "Songs added to playlist",
                    action: "add_songs",
                    playlistName: intent.playlistName,
                    songsAdded: 0
                });

            case "update_playlist":
                req.body.playlistName = intent.playlistName;
                req.body.name = intent.newPlaylistName;
                req.body.description = intent.description || "AI Generated";
                return await updatePlaylist(req, res, next);

            case "delete_songs":
                req.body.playlistName = intent.playlistName;
                if (intent.songs) {
                    req.body.trackNames = intent.songs.map((s: any) => s.title);
                }
                return await deleteSongs(req, res, next);

            case "delete_playlist":
                req.body.playlistName = intent.playlistName;
                return await deletePlaylist(req, res, next);

            default:
                return res.status(400).json({ success: false, message: "Gemini cannot handle user request." });
        }

    } catch (err) {
        console.error("AI Bridge error");
        next(err);
    }
} 