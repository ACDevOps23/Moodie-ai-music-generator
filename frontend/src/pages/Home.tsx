import { useAuthStore } from "../store/auth.store";
import { Sidebar } from "../components/layout/Sidebar";
import { useUIContext } from "../context/UIContext";
import { useSpotifyStore } from "../store/spotify.store";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { QuickChat } from "../components/ui/QuickChat";
import * as spotifyService from "../services/spotify.service";

export const Home = () => {
    const { user, isCheckingAuth } = useAuthStore();
    const { isSidebarCollapsed } = useUIContext();
    const { playlists, isSpotifyConnected, fetchPlaylists } = useSpotifyStore();
    const navigate = useNavigate();
    const [playlistImages, setPlaylistImages] = useState<Record<string, string>>({}); // State to store playlist images keyed by playlist ID

    useEffect(() => { // Fetch playlists when Spotify is connected and there are no playlists in the store
        if (isSpotifyConnected && playlists.length === 0) {
            fetchPlaylists();
        }
    }, [isSpotifyConnected]);

    useEffect(() => { // Pre-fetch playlist images for playlists that have tracks, to avoid showing empty playlists in the UI
        playlists.map(playlist => { 
            if (playlist.trackIds.length) 
                return;
        });
    }, [playlists])

    // Fetch images for recent playlists with rate limiting
    useEffect(() => {
        const recentPlaylists = playlists.slice(0, 3); // Only fetch images for the top 3 recent playlists to limit API calls
        if (recentPlaylists.length === 0) return;

        let isMounted = true; // Flag to prevent state updates if the component unmounts during the async operations

        const fetchImagesSequentially = async () => { // Fetch images one by one with a delay to avoid hitting Spotify API rate limits
            for (const playlist of recentPlaylists) {
                if (!isMounted) break; 
                if (playlistImages[playlist.playlistId]) continue; // Skip if we already have the image for this playlist

                try {
                    await new Promise(resolve => setTimeout(resolve, 150)); // Delay between requests to avoid rate limits
                    const imageUrl = await spotifyService.getPlaylistImages(playlist.playlistId); // Fetch the playlist image URL from the Spotify service
                    
                    if (isMounted && imageUrl) { // Only update state if the component is still mounted and we got a valid image URL
                        setPlaylistImages((prev) => ({
                            ...prev, // Keep existing images in state
                            [playlist.playlistId]: imageUrl // Update the state with the fetched image URL for this playlist
                        }));
                    }
                } catch (err) {
                    // Silent fail
                }
            }
        };

        fetchImagesSequentially(); // Start fetching images when playlists change

        return () => {
            isMounted = false; // Set the flag to false when the component unmounts to prevent state updates on an unmounted component
        };
    }, [playlists]);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-950 via-red-950 to-black flex items-center justify-center">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    const recentPlaylists = playlists.slice(0, 3); // Get the 3 most recent playlists to display on the home page

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-red-950 to-black flex">
            <Sidebar />
            <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"} border-l border-gradient overflow-auto`} style={{borderImage: "linear-gradient(to bottom, rgb(147, 51, 234), rgb(153, 27, 27), rgb(0, 0, 0)) 1"}}>
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-white text-4xl font-bold mb-2">Welcome, {user?.firstName}! 🎵</h1>
                    <p className="text-white/60">Let's make some music magic happen</p>
                </div>

                {/* Quick Actions */}
                <div className="mb-12">
                    <h2 className="text-white text-2xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => navigate("/chat")}
                            className="group bg-gradient-to-br from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 p-6 rounded-lg transition transform hover:scale-105"
                        >
                            <div className="text-4xl mb-3">💬</div>
                            <h3 className="text-white font-semibold mb-1">AI Music Chat</h3>
                            <p className="text-white/80 text-sm">Chat with Moodie to create playlists</p>
                        </button>
                        <button
                            onClick={() => navigate("/playlists")}
                            className="group bg-gradient-to-br from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 p-6 rounded-lg transition transform hover:scale-105"
                        >
                            <div className="text-4xl mb-3">🎵</div>
                            <h3 className="text-white font-semibold mb-1">My Playlists</h3>
                            <p className="text-white/80 text-sm">Manage your Spotify playlists</p>
                        </button>
                    </div>
                </div>

                {/* Recent Playlists */}
                {isSpotifyConnected && recentPlaylists.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white text-2xl font-semibold">Recent Playlists</h2>
                            {playlists.length > 3 && (
                                <button
                                    onClick={() => navigate("/playlists")}
                                    className="text-purple-400 hover:text-purple-300 text-sm transition"
                                >
                                    View all →
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentPlaylists.map((playlist) => ( // Display each recent playlist in a card format with the playlist image, name, description, and track count. Clicking on the card navigates to the playlist details page.
                                <div
                                    key={playlist.playlistId} // Use playlist ID as the key for efficient rendering
                                    className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg p-4 transition cursor-pointer"
                                >
                                    {/* Playlist Icon */}
                                    <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg mb-3 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition overflow-hidden">
                                        {playlistImages[playlist.playlistId] ? (
                                            <img
                                                src={playlistImages[playlist.playlistId]}
                                                alt={playlist.playlistName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl">🎵</span>
                                        )}
                                    </div>

                                    {/* Playlist Info */}
                                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                                        {playlist.playlistName}
                                    </h3>
                                    {playlist.description && (
                                        <p className="text-white/60 text-xs mb-3 line-clamp-1">
                                            {playlist.description}
                                        </p>
                                    )}

                                    {/* Track Count */}
                                    <span className="text-white/60 text-sm">
                                        {playlist.trackIds?.length || 0} tracks
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Spotify Connection Status - Only show if not connected */}
                {!isSpotifyConnected && (
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 mb-8">
                        <h3 className="text-blue-400 font-semibold mb-2">✨ Connect Spotify to Get Started</h3>
                        <p className="text-blue-300 text-sm mb-4">Connect your Spotify account to create AI-powered playlists and chat with Moodie</p>
                        <button
                            onClick={() => navigate("/spotify-connect")}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition"
                        >
                            Connect Spotify Now
                        </button>
                    </div>
                )}

                {/* Feature Cards */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <h2 className="text-white text-2xl font-semibold mb-4">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
                            <div className="text-3xl mb-3">🤖</div>
                            <h3 className="text-white font-semibold mb-2">AI Powered</h3>
                            <p className="text-white/60 text-sm">Powered by Gemini AI to understand your music taste</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
                            <div className="text-3xl mb-3">🎧</div>
                            <h3 className="text-white font-semibold mb-2">Spotify Integration</h3>
                            <p className="text-white/60 text-sm">Seamlessly create and manage Spotify playlists</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
                            <div className="text-3xl mb-3">🎵</div>
                            <h3 className="text-white font-semibold mb-2">Smart Playlists</h3>
                            <p className="text-white/60 text-sm">AI generates playlists based on your mood</p>
                        </div>
                    </div>
                </div>
            </main>
            <QuickChat />
        </div>
    )
}