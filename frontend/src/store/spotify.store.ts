import { create } from "zustand";
import * as spotifyService from "../services/spotify.service";

export interface Playlist {
    playlistId: string;
    playlistName: string;
    description: string;
    public: boolean;
    trackIds: string[];
}

type SpotifyState = {
    // Spotify connection
    isSpotifyConnected: boolean;
    spotifyUserId: string | null;
    spotifyUsername: string | null;
    
    // Playlists
    playlists: Playlist[];
    isLoadingPlaylists: boolean;
    
    // UI
    error: string | null;
    isLoading: boolean;

    // Actions
    checkSpotifyConnection: () => Promise<void>;
    initiateSpotifyLogin: () => void;
    fetchPlaylists: () => Promise<void>;
    createPlaylist: (name: string, description: string) => Promise<void>;
    addSongs: (playlistName: string, trackNames: string[], artistNames: string[]) => Promise<void>;
    updatePlaylist: (playlistName: string, newName: string, description: string) => Promise<void>;
    deletePlaylist: (playlistName: string) => Promise<void>;
    deleteSongs: (playlistName: string, trackNames: string[]) => Promise<void>;
    clearError: () => void;
};

export const useSpotifyStore = create<SpotifyState>((set) => ({
    // Initial state
    isSpotifyConnected: false,
    spotifyUserId: null,
    spotifyUsername: null,
    playlists: [],
    isLoadingPlaylists: false,
    error: null,
    isLoading: false,

    clearError: () => set({ error: null }),

    checkSpotifyConnection: async () => {
        try {
            set({ isLoading: true, error: null });
            const status = await spotifyService.checkSpotifyStatus();
            set({
                isSpotifyConnected: status.isConnected,
                spotifyUserId: status.spotifyUserId || null,
                spotifyUsername: status.username || null,
                isLoading: false
            });
        } catch (error: any) {
            set({
                isSpotifyConnected: false,
                error: error.message || "Failed to check Spotify connection",
                isLoading: false
            });
        }
    },

    initiateSpotifyLogin: () => {
        spotifyService.initiateSpotifyLogin();
    },

    fetchPlaylists: async () => {
        try {
            set({ isLoadingPlaylists: true, error: null });
            const playlists = await spotifyService.getMyPlaylists();
            set({ playlists, isLoadingPlaylists: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to fetch playlists",
                isLoadingPlaylists: false
            });
        }
    },

    createPlaylist: async (name: string, description: string) => {
        try {
            set({ isLoading: true, error: null });
            await spotifyService.createPlaylist(name, description);
            
            // Refresh playlists
            const playlists = await spotifyService.getMyPlaylists();
            set({ playlists, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to create playlist",
                isLoading: false
            });
            throw error;
        }
    },

    addSongs: async (playlistName: string, trackNames: string[], artistNames: string[]) => {
        try {
            set({ isLoading: true, error: null });
            await spotifyService.addSongsToPlaylist(playlistName, trackNames, artistNames);
            
            // Refresh playlists
            const playlists = await spotifyService.getMyPlaylists();
            set({ playlists, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to add songs",
                isLoading: false
            });
            throw error;
        }
    },

    updatePlaylist: async (playlistName: string, newName: string, description: string) => {
        try {
            set({ isLoading: true, error: null });
            await spotifyService.updatePlaylist(playlistName, newName, description);
            
            // Refresh playlists
            const playlists = await spotifyService.getMyPlaylists();
            set({ playlists, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to update playlist",
                isLoading: false
            });
            throw error;
        }
    },

    deletePlaylist: async (playlistName: string) => {
        try {
            set({ isLoading: true, error: null });
            await spotifyService.deletePlaylist(playlistName);
            
            // Refresh playlists
            const playlists = await spotifyService.getMyPlaylists();
            set({ playlists, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to delete playlist",
                isLoading: false
            });
            throw error;
        }
    },

    deleteSongs: async (playlistName: string, trackNames: string[]) => {
        try {
            set({ isLoading: true, error: null });
            await spotifyService.deleteSongsFromPlaylist(playlistName, trackNames);
            
            // Refresh playlists
            const playlists = await spotifyService.getMyPlaylists();
            set({ playlists, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to delete songs",
                isLoading: false
            });
            throw error;
        }
    }
}));