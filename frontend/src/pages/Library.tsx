import { useEffect, useState } from "react";
import { useSpotifyStore } from "../store/spotify.store";
import { useUIContext } from "../context/UIContext";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { QuickChat } from "../components/ui/QuickChat";
import * as spotifyService from "../services/spotify.service";

export const Library = () => {
    const {
        playlists,
        isLoadingPlaylists,
        isSpotifyConnected,
        error,
        clearError,
        fetchPlaylists,
        createPlaylist,
        deletePlaylist
    } = useSpotifyStore();
    const { isSidebarCollapsed } = useUIContext();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [playlistImages, setPlaylistImages] = useState<Record<string, string>>({});
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (isSpotifyConnected && playlists.length === 0) {
            fetchPlaylists();
        }
    }, [isAuthenticated, isSpotifyConnected]);

    // Fetch images for all playlists with rate limiting
    useEffect(() => {
        if (playlists.length === 0) return;

        let isMounted = true;
        let requestCount = 0;

        const fetchImagesSequentially = async () => {
            for (const playlist of playlists) {
                if (!isMounted) break;
                if (playlistImages[playlist.playlistId]) continue;

                try {
                    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between requests
                    const imageUrl = await spotifyService.getPlaylistImages(playlist.playlistId);
                    
                    if (isMounted && imageUrl) {
                        setPlaylistImages((prev) => ({
                            ...prev,
                            [playlist.playlistId]: imageUrl
                        }));
                    }
                    requestCount++;
                } catch (err) {
                    console.error(`Failed to fetch image for ${playlist.playlistId}:`, err);
                }
            }
        };

        fetchImagesSequentially();

        return () => {
            isMounted = false;
        };
    }, [playlists]);

    const handleCreatePlaylist = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        setIsCreating(true);
        try {
            await createPlaylist(newPlaylistName, newPlaylistDesc);
            setNewPlaylistName("");
            setNewPlaylistDesc("");
            setShowCreateForm(false);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeletePlaylist = async (playlistName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${playlistName}"?`)) return;

        setIsDeleting(playlistName);
        try {
            await deletePlaylist(playlistName);
            await fetchPlaylists();
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <>
        <title>Your Playlists - Moodie</title>
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-red-950 to-black flex">
            <Sidebar />
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"} flex-1 p-8`}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">My Playlists</h1>
                            <p className="text-white/60">Manage your Spotify playlists</p>
                        </div>
                        {isSpotifyConnected && (
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg transition"
                            >
                                + New Playlist
                            </button>
                        )}
                    </div>

                    {/* Spotify Connection Status - Only show if not connected */}
                    {!isSpotifyConnected && (
                        <div className="mb-6 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                            <p className="text-blue-400 text-sm font-semibold mb-2">✨ Connect Spotify to manage playlists</p>
                            <p className="text-blue-300 text-sm mb-3">You need to connect your Spotify account to create and manage playlists with AI</p>
                            <button
                                onClick={() => navigate("/spotify-connect")}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1.5 rounded text-sm transition"
                            >
                                Connect Spotify
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-2">
                            <span className="text-red-400 text-sm flex-1">{error}</span>
                            <button
                                onClick={clearError}
                                className="text-red-400 hover:text-red-300 text-lg"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Create Playlist Form */}
                    {showCreateForm && isSpotifyConnected && (
                        <form
                            onSubmit={handleCreatePlaylist}
                            className="mb-8 bg-white/10 border border-white/20 rounded-lg p-6"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">Create New Playlist</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Playlist name"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                                    required
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={newPlaylistDesc}
                                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none h-20"
                                />
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewPlaylistName("");
                                            setNewPlaylistDesc("");
                                        }}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating || !newPlaylistName.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? "Creating..." : "Create"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Playlists Grid */}
                    {isLoadingPlaylists ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/60">Loading playlists...</p>
                            </div>
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                            <p className="text-white/60 text-lg mb-4">No playlists yet</p>
                            {isSpotifyConnected && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg transition"
                                >
                                    Create Your First Playlist
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.playlistId}
                                    className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg p-6 transition cursor-pointer"
                                >
                                    {/* Playlist Icon */}
                                    <div className="w-full h-40 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition overflow-hidden">
                                        {playlistImages[playlist.playlistId] ? (
                                            <img
                                                src={playlistImages[playlist.playlistId]}
                                                alt={playlist.playlistName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-5xl">🎵</span>
                                        )}
                                    </div>

                                    {/* Playlist Info */}
                                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                        {playlist.playlistName}
                                    </h3>
                                    {playlist.description && (
                                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                                            {playlist.description}
                                        </p>
                                    )}

                                    {/* Playlist Stats */}
                                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/10">
                                        <span className="text-white/60 text-sm">
                                            {playlist.trackIds?.length || 0} tracks
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            playlist.public
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                            {playlist.public ? "Public" : "Private"}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.open(`https://open.spotify.com/playlist/${playlist.playlistId}`, '_blank')}
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlaylist(playlist.playlistName)}
                                            disabled={isDeleting === playlist.playlistName}
                                            className="flex-1 bg-red-600/30 hover:bg-red-600/50 disabled:bg-gray-600/30 border border-red-600/50 disabled:border-gray-600/50 text-red-400 disabled:text-gray-400 text-sm font-medium py-2 rounded-lg transition disabled:cursor-not-allowed"
                                        >
                                            {isDeleting === playlist.playlistName ? "..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <QuickChat />
        </div>
        </>
    );
}