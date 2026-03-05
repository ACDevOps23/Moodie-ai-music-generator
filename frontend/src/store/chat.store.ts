import { create } from "zustand";
import * as geminiService from "../services/gemini.service";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    action?: {
        type: string;
        playlistName?: string;
        description?: string;
        tracks?: Array<{ name: string; artist: string }>;
    };
}

type ChatState = {
    // Chat data
    messages: ChatMessage[];
    
    // UI
    isLoading: boolean;
    error: string | null;
    
    // Actions
    sendMessage: (prompt: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    clearChat: () => void;
    clearError: () => void;
    loadChatHistory: (messages: ChatMessage[]) => void;
};

export const useChatStore = create<ChatState>((set) => {
    // Listen for visibility change to clear chat when user leaves Chat page
    if (typeof window !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Optionally clear chat when tab loses focus
                // set({ messages: [] });
            }
        });
    }

    return {
        // Initial state
        messages: [],
        isLoading: false,
        error: null,

        clearError: () => set({ error: null }),

        addMessage: (message: ChatMessage) => {
            set((state) => ({
                messages: [...state.messages, message]
            }));
        },

        clearChat: () => {
            set({ messages: [], error: null });
        },

        loadChatHistory: (messages: ChatMessage[]) => {
            set({ messages });
        },

        sendMessage: async (prompt: string) => {
            try {
                set({ isLoading: true, error: null });

                // Add user message to chat
                const userMessage: ChatMessage = {
                    id: `msg_${Date.now()}_user`,
                    role: "user",
                    content: prompt,
                    timestamp: Date.now()
                };
                set((state) => ({
                    messages: [...state.messages, userMessage]
                }));

                // Get AI response
                const response = await geminiService.sendGeminiMessage(prompt);

                // Add assistant message to chat
                const assistantMessage: ChatMessage = {
                    id: `msg_${Date.now()}_assistant`,
                    role: "assistant",
                    content: response.message,
                    timestamp: Date.now(),
                    action: {
                        type: response.action,
                        playlistName: response.playlistName,
                        description: response.description,
                        tracks: response.tracks || []
                    }
                };

                set((state) => ({
                    messages: [...state.messages, assistantMessage],
                    isLoading: false
                }));
            } catch (error: any) {
                set({
                    error: error.message || "Failed to send message",
                    isLoading: false
                });
            }
        }
    };
});
