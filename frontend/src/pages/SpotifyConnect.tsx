import { useEffect } from "react";
import { useSpotifyStore } from "../store/spotify.store";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { useUIContext } from "../context/UIContext";

// The SpotifyConnect component is responsible for handling the Spotify authentication flow. It checks if the user is authenticated and
//  if Spotify is already connected. If the user is not authenticated, it redirects to the login page. If Spotify is already connected, it redirects to the playlists page. Otherwise, it renders a page with information about connecting
//  Spotify and a button to initiate the Spotify login process.
export const SpotifyConnect = () => {
    const { initiateSpotifyLogin, isSpotifyConnected } = useSpotifyStore();
    const { isAuthenticated } = useAuthStore();
    const { isSidebarCollapsed } = useUIContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // If already connected, redirect to playlists
    useEffect(() => {
        if (isSpotifyConnected) {
            navigate("/playlists");
        }
    }, [isSpotifyConnected, navigate]);

    const handleSpotifyLogin = () => {
        initiateSpotifyLogin();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-red-950 to-black flex">
            <Sidebar />
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"} flex-1`}>
                <div className="min-h-screen flex items-center justify-center p-8">
                    <div className="max-w-md w-full">
                        <div className="bg-white/10 border border-white/20 rounded-xl p-8 text-center">
                            {/* Spotify Logo */}
                            <div className="text-6xl mb-6">🎵</div>

                            <h1 className="text-3xl font-bold text-white mb-2">Connect Spotify</h1>
                            <p className="text-white/60 mb-8">
                                Connect your Spotify account to create playlists and use AI music chat
                            </p>

                            {/* Benefits */}
                            <div className="bg-gradient-to-r from-purple-600/20 to-red-600/20 rounded-lg p-4 mb-8 text-left">
                                <ul className="space-y-2 text-sm text-white/80">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        Create and manage playlists
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        Use AI to generate playlists
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        Chat with AI about music
                                    </li>
                                </ul>
                            </div>

                            {/* Connect Button */}
                            <button
                                onClick={handleSpotifyLogin}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 mb-4"
                            >
                                Connect with Spotify
                            </button>

                            {/* Cancel Button */}
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-lg transition"
                            >
                                Maybe Later
                            </button>

                            {/* Info */}
                            <p className="text-xs text-white/40 mt-6">
                                We only access your public Spotify profile and don't store any sensitive data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
