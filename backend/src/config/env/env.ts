import { config } from "dotenv";
// Load environment variables from a file based on the current NODE_ENV
config({path: `.env.${process.env.NODE_ENV || "development"}.local`});

export const { PORT, NODE_ENV, DB_URI, JWT_SECRET,
    COOKIE_NAME, REFRESH_COOKIE_NAME, COOKIE_SECRET, DASHBOARD_URL } = process.env;