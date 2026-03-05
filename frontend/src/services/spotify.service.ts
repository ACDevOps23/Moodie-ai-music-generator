import axios from "axios";

const SPOTIFY_API = import.meta.env.VITE_WEB_AUTH_API;

export interface Playlist {
    playlistId: string;
    playlistName: string;
    description: string;
    public: boolean;
    trackIds: string[];
}

export interface SpotifyStatus {
    isConnected: boolean;
    spotifyUserId?: string;
    username?: string;
}

// Check if user is connected to Spotify
const checkSpotifyStatus = async (): Promise<SpotifyStatus> => {
    try {
        const response = await axios.get(`${SPOTIFY_API}/spotify/status`, { withCredentials: true });
        return {
            isConnected: response.data.success === true,
            spotifyUserId: response.data.spotifyUserId,
            username: response.data.username
        };
    } catch (error: any) {
        return { isConnected: false };
    }
};

// Initiate Spotify login flow
const initiateSpotifyLogin = () => {
    window.location.href = `${SPOTIFY_API}/auth/spotify/login`;
};

// Get user's playlists
const getMyPlaylists = async (): Promise<Playlist[]> => {
    try {
        const response = await axios.get(`${SPOTIFY_API}/spotify/playlists`, { withCredentials: true });
        return response.data.playlists || [];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch playlists");
    }
};

// Create a new playlist
const createPlaylist = async (playlistName: string, description: string): Promise<Playlist> => {
    try {
        const response = await axios.post(`${SPOTIFY_API}/spotify/create-playlist`, {
            playlistName,
            description
        }, { withCredentials: true });
        return response.data.playlist;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to create playlist");
    }
};

// Add songs to playlist
const addSongsToPlaylist = async (
    playlistName: string,
    trackNames: string[],
    artistName: string[]
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.post(`${SPOTIFY_API}/spotify/add-songs`, {
            playlistName,
            trackNames,
            artistName
        }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to add songs");
    }
};

// Update playlist
const updatePlaylist = async (
    playlistName: string,
    newPlaylistName: string,
    description: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.put(`${SPOTIFY_API}/spotify/update-playlist`, {
            playlistName,
            name: newPlaylistName,
            description
        }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update playlist");
    }
};

// Delete playlist
const deletePlaylist = async (playlistName: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.delete(`${SPOTIFY_API}/spotify/delete-playlist`, {
            data: { playlistName },
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete playlist");
    }
};

// Delete songs from playlist
const deleteSongsFromPlaylist = async (
    playlistName: string,
    trackNames: string[]
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.post(`${SPOTIFY_API}/spotify/delete-playlist-song`, {
            playlistName,
            trackNames
        }, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete songs");
    }
};

// Get playlist images with retry for rate limits
const getPlaylistImages = async (playlistId: string, retries = 3): Promise<string | null> => {
    try {
        // Call backend proxy endpoint to get images from Spotify
        const response = await axios.get(`${SPOTIFY_API}/spotify/playlist/${playlistId}/images`, { 
            withCredentials: true 
        });
        
        // Return the first image URL if available
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0].url;
        }
        return null;
    } catch (error: any) {
        // If rate limited (429), retry after delay
        if (error.response?.status === 429 && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            return getPlaylistImages(playlistId, retries - 1);
        }
        
        // Silent fail - just return null instead of logging errors
        return null;
    }
};

export {
    checkSpotifyStatus,
    initiateSpotifyLogin,
    getMyPlaylists,
    createPlaylist,
    addSongsToPlaylist,
    updatePlaylist,
    deletePlaylist,
    deleteSongsFromPlaylist,
    getPlaylistImages
};
