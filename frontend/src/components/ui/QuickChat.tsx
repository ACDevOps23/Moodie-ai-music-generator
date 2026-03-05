import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/chat.store";
import { useSpotifyStore } from "../../store/spotify.store";

// The QuickChat component provides a floating chat interface that allows users to quickly send messages to the AI assistant.
//  It checks if the user is connected to Spotify before rendering, and it manages its own open/close state and input value. 
// When the user submits a message, it calls the sendMessage function from the chat store and clears the input field.
export const QuickChat = () => {
    const { sendMessage, isLoading } = useChatStore();
    const { isSpotifyConnected } = useSpotifyStore();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!input.trim() || !isSpotifyConnected) return;
        
        await sendMessage(input);
        setInput("");
    };

    if (!isSpotifyConnected) return null;

    return (
        <div className="fixed bottom-8 right-8 z-40">
            {isOpen && (
                <div className="ßmb-4 bg-gradient-to-b from-purple-950 via-red-950 to-black border border-white/20 rounded-lg p-4 w-80 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm">💬 Quick Chat</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/60 hover:text-white text-lg"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Moodie..."
                            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:border-purple-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-3 py-2 rounded text-sm transition disabled:cursor-not-allowed"
                        >
                            {isLoading ? "..." : "→"}
                        </button>
                    </form>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                    className={!isOpen ? "bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-purple-500/50 transition text-xl" : "hidden"}
                    title="Quick Chat"
            
            >
                {isOpen ? "" : "💬"} 
            </button>
        </div>
    );
};
