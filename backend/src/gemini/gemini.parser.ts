import { GoogleGenAI, Type } from "@google/genai";
import { PLAYLIST_DESCRIPTION_PROMPT, PLAYLIST_NAME_PROMPT,
         NEW_PLAYLIST_NAME_PROMPT, ADD_TRACKS_PROMPT, GEMINI_ROLE_PROMPT } from "./prompts.js";


const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini Parsa JSON Output Schema 
const geminiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            enum: ["create_playlist", "add_songs", "update_playlist", "delete_songs", "delete_playlist"],
        },
        playlistName: {
            type: Type.STRING,
            description: PLAYLIST_NAME_PROMPT,
        },
        newPlaylistName: {
            type: Type.STRING,
            description: NEW_PLAYLIST_NAME_PROMPT
        }, 
        description: {
            type: Type.STRING,
            description: PLAYLIST_DESCRIPTION_PROMPT,
        },
        songs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                   title: { type: Type.STRING },
                   artist: { type: Type.STRING },
                },
                required: ["title", "artist"]
            },
            description: ADD_TRACKS_PROMPT,
        },
    },
    required: ["action"]
}
// Function to parse user prompt and generate structured response using Gemini API
export const parseUserPrompt = async(userPrompt: string) => {
    const response = await genAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
            role: "user",
            parts: [{ text: userPrompt }]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema,
            systemInstruction: GEMINI_ROLE_PROMPT
        }
    });
    return JSON.parse(response.text);
}