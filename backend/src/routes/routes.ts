import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
//import moodie_chatRouter from "./moodie.chat.routes.js";
import spotifyRouter from "./spotify.user.routes.js";
import geminiRouter from "./gemini.route.js";

const appRouter = Router();

// User & Spotify Authentication
appRouter.use("/auth", authRouter); 
// user dashbaord 
appRouter.use("/user", userRouter);
// spotify services 
appRouter.use("/spotify", spotifyRouter);
// gemini chat
appRouter.use("/genAI", geminiRouter);

export default appRouter;