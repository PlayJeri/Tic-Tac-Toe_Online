import { NextFunction, Response, Request } from "express";
import { secretKey } from "../controllers/authControllers";
import { DecodedAccessToken } from "./types";
import jwt from 'jsonwebtoken';


/**
 * Middleware for validating an authentication token.
 */
export const validateTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Extract the token from signed cookies
    const token = req.signedCookies["auth_token"] as string;

    // Check if the token is missing or empty
    if (!token || token.trim() === "") {
        return res.status(401).json({ error: "Unauthorized - Token not provided" });
    }

    // Verify the token's authenticity using the provided secretKey
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            // If the token is invalid or expired, return an unauthorized response
            return res.status(401).json({ error: "Unauthorized - Invalid token" });
        }

        // If the token is valid, store its decoded payload in the response's locals
        const tokenPayload = decoded as DecodedAccessToken;
        res.locals.jwtData = tokenPayload;

        // Continue with the next middleware or route handler
        next();
    });
};
