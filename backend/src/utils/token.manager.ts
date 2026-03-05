import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JWT_SECRET } from "../config/env/env.js";

// Define an interface for the JWT payload
interface JwtPayloadArgs extends jwt.JwtPayload {
    id: string,
    email: string
}
    // The `createToken` function generates a JWT token for a user based on their ID and email. It takes the user ID, email, 
    // and desired expiration time as arguments, constructs a payload with the user information, and signs it using the JWT secret key 
    // to create the token. This token can then be used for authentication purposes in the application, allowing users to securely access 
    // protected routes and resources.
   const createToken = (id: string, email: string, expiresIn: any) => { // createToken function
        const payload = { id, email,};
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn }); // Sign the token with the payload and secret
        return token;
    }
    // The `createRefreshToken` function generates a new JWT refresh token for a user based on their ID and email. It takes the user ID, email, and 
    // desired expiration time as arguments, and internally calls the `createToken` function to create the token. This allows for consistent token 
    // generation logic and makes it easy to create both access tokens and refresh tokens with different expiration times as needed in the authentication flow of the application.
    const createRefreshToken = (id: string, email: string, expiresIn: any) => { // createRefreshToken function
        const refreshedToken = createToken(id, email, expiresIn); // Reuse createToken to generate refresh token
        return refreshedToken;
    } 
 // The `removeToken` function takes an HTTP request, response, and a JWT token as arguments. It verifies the token using the JWT secret key, 
 // decodes it to extract the payload (which includes user ID and email), and returns the decoded token data. This function is typically used to 
 // validate and decode a JWT token when a user logs out or when the token needs to be invalidated.// It ensures that the token is valid and can be 
 // safely removed from the client's storage (e.g., cookies) without risking unauthorized access. If the token is invalid or expired, it will throw an 
 // error, which should be handled appropriately in the calling code.// The `createToken` and `createRefreshToken` functions are responsible for
 //  generating JWT tokens with a specified payload (user ID and email) and expiration time. The `createRefreshToken` function is essentially a 
 // wrapper around `createToken`, allowing for the creation of refresh tokens with potentially different expiration times than 
 // access tokens. These functions are essential for implementing authentication and session management in a web application, enabling 
 // secure user login and token-based authentication mechanisms.
    const removeToken = (req: Request, res: Response, token: string) => { // removeToken function
        const decodeToken = jwt.verify(token, JWT_SECRET) as JwtPayloadArgs; // Verify and decode the token
        return decodeToken;
    }


export { createToken, createRefreshToken, removeToken };