import mongoose, { Document } from "mongoose";
import { ParsedUrlQueryInput } from "querystring";

// Spotify Session Interface
export interface ISpotifySession extends Document {
    userId: mongoose.Schema.Types.ObjectId,
    spotifyUserId: string,
    username: string,
    access_token: string,
    refresh_token: string,
    expires_in: Date,
    playlists: [{
      playlistId: string,
      playlistName: string,
      description: string,
      public: boolean,
      trackIds: [string]
    }]
}

// Spotify Auth URL Parameters Interface
export interface SpotifyURLAuthParams extends ParsedUrlQueryInput {
  client_id: string;
  response_type: string;
  redirect_uri: string,
  scope: string,
  code_challenge_method: string,
  code_challenge: string
}
// Spotify Access Token Request Interface
export interface SpotifyAccessTokenReq extends ParsedUrlQueryInput {
  grant_type: string,
  code: string,
  redirect_uri: string,
  client_id: string, 
  code_verifier: string
}
// Spotify Access Token Response Interface
export interface SpotifyAccessToken {
  access_token: string, 
  token_type: string,
  scope: string,
  expires_in: number,
  refresh_token: string
}