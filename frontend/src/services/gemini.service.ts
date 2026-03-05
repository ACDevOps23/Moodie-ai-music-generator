import axios, { AxiosError } from "axios";

const API_BASE = import.meta.env.VITE_WEB_AUTH_API || "http://localhost:3000";

interface GeminiResponse {
    action: string;
    playlistName?: string;
    description?: string;
    tracks?: Array<{
        name: string;
        artist: string;
    }>;
    message: string;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

/**
 * Send a message to the Gemini AI service
 * Requires Spotify verification (spotifyVerified middleware)
 */
export const sendGeminiMessage = async (userPrompt: string): Promise<GeminiResponse> => {
    try {
        const response = await axios.post<GeminiResponse>(
            `${API_BASE}/genAi/chat`,
            { userPrompt },
            { withCredentials: true }
        );
        return response.data;
    } catch (error: any) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response?.status === 401) {
            throw new Error("You must be logged in to use the AI chat");
        }
        if (axiosError.response?.status === 403) {
            throw new Error("You must connect your Spotify account first");
        }
        if (axiosError.response?.data?.message) {
            throw new Error(axiosError.response.data.message);
        }
        throw new Error("Failed to get AI response. Please try again");
    }
};

/**
 * Format a chat message for display
 */
export const formatChatMessage = (message: ChatMessage): ChatMessage => {
    return {
        ...message,
        timestamp: message.timestamp || Date.now()
    };
};

/**
 * Parse Gemini response for action type
 */
export const parseGeminiAction = (response: GeminiResponse) => {
    return {
        action: response.action,
        playlistName: response.playlistName,
        description: response.description,
        tracks: response.tracks || [],
        message: response.message
    };
};
