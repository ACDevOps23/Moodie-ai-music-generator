import crypto from "crypto";
// PKCE (Proof Key for Code Exchange) helper functions for Spotify OAuth
const generateCodeVerifier = (): string => {
    return crypto.randomBytes(64).toString("hex"); // 128 characters
}
// Generates a random code verifier string
const generateCodeChallenge = (codeVerifier: string): string => { // SHA256 hash of the code verifier
    const hash = crypto.createHash("sha256").update(codeVerifier).digest(); // Buffer
    return hash.toString("base64") // URL-safe base64 encoding
    .replace(/=/g, "") // Remove padding
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
}

export { generateCodeVerifier, generateCodeChallenge };