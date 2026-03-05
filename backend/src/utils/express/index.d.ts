import { HydratedDocument } from "mongoose";
import { IUserAccount } from "../../types/user.types.ts";

interface Locals { // Define the shape of res.locals
    user: HydratedDocument<IUserAccount>;
}

// Extend Express Request interface to include spotify_user property
declare module "express" {
  export interface Request {
    spotify_user?: {
      id: string;
      username: string;
      access_token: string;
      refresh_token: string;
    };
  }
}

