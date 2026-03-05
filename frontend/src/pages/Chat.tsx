import { useEffect, useRef } from "react";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";
import { useSpotifyStore } from "../store/spotify.store";
import { useUIContext } from "../context/UIContext";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";

export const Chat = () => { // Main Chat page component
    const {
        messages,
        isLoading,
        error,
        sendMessage,
        clearError,
        clearChat
    } = useChatStore();
    const { isSpotifyConnected } = useSpotifyStore(); // Check if Spotify is connected
    const { isSidebarCollapsed } = useUIContext(); // Get sidebar state from UI context
    const { isAuthenticated } = useAuthStore(); // Check if user is authenticated
    const navigate = useNavigate(); // For programmatic navigation
    const inputRef = useRef<HTMLInputElement>(null); // Ref for the message input field
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to the bottom of the messages

    useEffect(() => { // Scroll to the bottom of the chat when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => { 
        // Clear chat when leaving the Chat page
        return () => {
            clearChat();
        };
    }, [clearChat]);

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }
    // Handle sending a message when the form is submitted
    const handleSendMessage = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const message = inputRef.current?.value.trim(); 
        if (!message) return;

        if (!isSpotifyConnected) {
            clearError();
            return;
        }

        if (inputRef.current) inputRef.current.value = ""; // Clear the input field after sending the message
        await sendMessage(message); // Send the message to the chat store, which will handle the API call and response
    };

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the chat history?")) {
            clearChat();
        }
    };

    return ( // Main JSX for the Chat page
        <>
        <title>Chat - Moodie</title>
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-red-950 to-black flex">
            <Sidebar />
            <div className={`p-8 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"} flex-1`}>
                <div className="max-w-4xl mx-auto h-screen flex flex-col">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">AI Music Chat</h1>
                            <p className="text-white/60">Chat with Moodie AI to discover and create playlists</p>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearChat}
                                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg transition"
                            >
                                Clear Chat
                            </button>
                        )}
                    </div>

                    {/* Spotify Connection Warning */}
                    {!isSpotifyConnected && (
                        <div className="mb-6 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                            <p className="text-blue-400 text-sm">
                                ⚠️ Connect your Spotify account in Settings to use the AI chat feature
                            </p>
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

                    {/* Messages Container */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 mb-6 overflow-y-auto space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-5xl mb-3">💬</div>
                                    <p className="text-white/60 text-lg">Start a conversation!</p>
                                    <p className="text-white/40 text-sm mt-2">Ask me to create playlists, find songs, or help with your music</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                msg.role === "user"
                                                    ? "bg-gradient-to-r from-purple-600 to-red-600 text-white"
                                                    : "bg-white/10 border border-white/20 text-white/90"
                                            }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            {msg.action && msg.role === "assistant" && (
                                                <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70">
                                                    <p>Action: {msg.action.type}</p>
                                                    {msg.action.playlistName && (
                                                        <p>Playlist: {msg.action.playlistName}</p>
                                                    )}
                                                    {msg.action.tracks && msg.action.tracks.length > 0 && (
                                                        <p>Tracks: {msg.action.tracks.length}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 border border-white/20 text-white/90 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                                <span className="text-sm">Moodie is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={isSpotifyConnected ? "Ask me anything..." : "Connect Spotify to chat"}
                            disabled={!isSpotifyConnected || isLoading}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!isSpotifyConnected || isLoading}
                            className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition"
                        >
                            {isLoading ? "..." : "Send"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}