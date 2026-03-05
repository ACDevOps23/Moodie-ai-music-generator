import { Router } from "express";
import { geminiHandler } from "../controllers/gemini.controller.js"; 
import { authenticated } from "../middleware/auth.middleware.js";
import { spotifyVerified } from "../middleware/spotify.middleware.js";

const geminiRouter = Router();

// API route for handling Gemini chat interactions, protected by authentication and Spotify verification middleware
geminiRouter.post("/chat", authenticated, spotifyVerified, geminiHandler);

export default geminiRouter;