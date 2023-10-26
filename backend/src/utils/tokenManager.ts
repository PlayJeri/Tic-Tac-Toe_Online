import jwt from 'jsonwebtoken';

// Load environment variables.
import dotenv from 'dotenv';
dotenv.config();


export const createToken = (userId: number, username: string, expiresIn: string) => {
    // Create a payload for the JWT.
    const payload = { userId, username };

    // Use the jwt.sign method to create a JWT using the payload and a secret key from the environment variables.
    const token = jwt.sign(payload, process.env.SECRET_KEY!, {
        expiresIn, // Set the expiration time for the token
    });

    return token;
};