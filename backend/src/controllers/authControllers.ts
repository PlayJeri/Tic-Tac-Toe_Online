import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { validateUsername } from "../utils/authHelpers";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const prisma = new PrismaClient();
export const secretKey = process.env.SECRET_KEY!;


// Handles user login and returns JWT token if login is successful.
export const login = async (req: Request, res: Response) => {
    try {
        // Extract username and password from request body.
        const { username, password } = req.body;

        // Find the user in the database with provided username.
        const user = await prisma.user.findFirst({ where: { username: username }});

        // If no user is found returns 404 response.
        if (!user) {
            return res.status(404).json({
                error: "User with that username does not exist"
            });
        }

        // Compares the provided password with the hashed password from user stored in the database.
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If the password don't match returns 401 response.
        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Create payload for token with information about the user.
        const tokenPayload = {
            userId: user.id,
            username: user.username
        }

        // Sign the token with secret key with one hour expiration date.
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

        // Return 200 response with the signed JWT
        return res.status(200).json({
            message: "Login successful",
            token: token
        })
    } catch (error) {
        // Handles any unexpected errors.
        console.error('Login error: ', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// Handles user registration by validating input and creating a new user in the database.
export const register = async (req: Request, res: Response) => {
    try {
        // Destructure registration data from the request body.
        const { username, password, password2 } = req.body;

        // Check if the 'username' field is missing. Return 400 if so.
        if (!username) {
            return res.status(400).json({ error: "username is missing" });
        }

        // Check if 'password' and 'password2' fields are missing or do not match. Return 400 if so.
        if (!password || !password2 || password !== password2) {
            return res.status(400).json({ error: "passwords missing or did not match" });
        }

        // Validates the username with helper function. Returns 400 if invalid.
        const validUsername = await validateUsername(username);
        if (validUsername !== true) {
            return res.status(400).json({ error: validUsername });
        }

        // Hash the user's password before storing it in the database.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database with the provided data.
        const user = await prisma.user.create({
            data: {
                username: username.trim().toLowerCase(),
                password: hashedPassword,
                wins: 0,
                losses: 0
            }
        });

        // Check if user creation failed and handle it accordingly. Returns 500 if fails.
        if (!user) {
            return res.status(500).json({ error: "User creation failed" });
        }

        // Return a successful response with a 201 status code.
        return res.status(201).json({ success: `User: ${username.trim()} created` });

    } catch (error) {
        // Handle any unexpected errors and log them for debugging purposes.
        console.error('Register error: ', error);

        // Return a 500 response for internal server errors.
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


// Returns 200 status.
export const validateLogin = (req: Request, res: Response) => {
    return res.sendStatus(200);
}