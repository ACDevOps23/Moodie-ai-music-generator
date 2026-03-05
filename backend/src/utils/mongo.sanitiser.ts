import { Request, Response, NextFunction } from "express";
import sanitize from "mongo-sanitize";

// Middleware to sanitize incoming requests to prevent NoSQL injection attacks
export const mongoSanitiser = (req: Request, res: Response, next: NextFunction) => {

    req.body = sanitize(req.body); // Sanitize the request body to remove any potentially malicious content that could be used for NoSQL injection attacks.
    req.params = sanitize(req.params); // Sanitize the request parameters to ensure that any user input included in the URL is also cleaned of potentially harmful content.

    // Sanitize query parameters if they exist and are an object, preventing NoSQL injection through query strings.
    if (req.query && typeof req.query === "object") {
        for (const key in req.query) {
            req.query[key] = sanitize(req.query[key]);
        }
    }
    // Sanitize specific properties that may contain sensitive information
    // req.signedCookies?.jwt checks if signedCookies and jwt exist without causing runtime errors
        if (req.signedCookies?.jwt) { // prevents runtime errors if those properties are undefined.
            req.signedCookies.jwt = sanitize(req.signedCookies.jwt);
        }

        if (req.headers?.authorization) { // prevents runtime errors if those properties are undefined.
            req.headers.authorization = sanitize(req.headers.authorization);
        }

        if (res.locals?.user) { // prevents runtime errors if those properties are undefined.ßß
            res.locals.user = sanitize(res.locals.user);
        }

        next(); // Call the next middleware or route handler in the Express.js request-response cycle, allowing the sanitized request to be processed further down the line.
    };
