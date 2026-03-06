import express from "express";
import cors from "cors";
import appRouter from "./routes/routes.js";
import { COOKIE_SECRET } from "./config/env/env.js";
import { CORS_ORIGIN } from "./config/env/env.spotify.js";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import { mongoSanitiser } from "./utils/mongo.sanitiser.js";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

const RateLimiter = rateLimit({ // rate limiter to prevent brute-force attacks
    windowMs: 10 * 60 * 1000,
    limit: 10,
    message: "Too many attempts from this IP."
});

// middlewares
app.use(cors({ // to enable CORS
    origin: CORS_ORIGIN, 
    credentials: true,
}));

app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({extended: true})); // to parse URL-encoded bodies
app.use(express.static('public')); // to serve static files
app.use(cookieParser(COOKIE_SECRET)); // to parse cookies
app.use(mongoSanitiser); // to prevent NoSQL injection
app.use(morgan("dev")); // to log HTTP requests
app.use(helmet()); // to set secure HTTP headers
app.use(RateLimiter); // apply rate limiting
app.disable("x-powered-by"); // disable x-powered-by (remove response header ) for security in production

app.use("/moodie/api/v1/", appRouter); // main application routes

export default app;