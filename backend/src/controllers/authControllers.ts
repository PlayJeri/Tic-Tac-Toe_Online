import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { validateUsername } from "../utils/authHelpers";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { createToken } from "../utils/tokenManager";
import { getUser } from "../utils/prismaHelpers";

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

        // Clear the old cookie
        res.clearCookie("auth_token", {
            domain: "localhost",
            signed: true,
            path: "/",
        });

        // Sign the token with secret key with one hour expiration date and set it as HTTP only cookie.
        const token = createToken(user.id, user.username, "10h")
        const oneHourFromNow = new Date();
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 70);
        res.cookie("auth_token", token, {
            path: "/",
            domain: "localhost",
            expires: oneHourFromNow,
            signed: true,
            httpOnly: true,
        })

        // Return 200 response and username + id
        return res.status(200).json({
            message: "Login successful",
            username: user.username,
            id: user.id
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
        const { username, password, retypePassword } = req.body;

        // Check if the 'username' field is missing. Return 400 if so.
        if (!username) {
            return res.status(400).send("username is missing");
        }

        // Check if 'password' and 'password2' fields are missing or do not match. Return 400 if so.
        if (!password || !retypePassword || password !== retypePassword) {
            return res.status(400).send("passwords missing or did not match");
        }

        // Validates the username with helper function. Returns 400 if invalid.
        const validUsername = await validateUsername(username);
        if (validUsername !== true) {
            return res.status(400).send(validUsername);
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


/**
 * Verify the user's identity based on the JWT data and return user information.
 */
export const verifyUser = async (req: Request, res: Response) => {
    try {
        // Retrieve the user based on the JWT data
        const user = await getUser(res.locals.jwtData!.username);

        // Check if no user is found
        if (!user) {
            console.error("Verify user error: No user found");
            return res.status(401).send("Login verification failed");
        }

        // Return user information as a JSON response
        return res.status(200).json({ message: "OK", username: user.username, id: user.id });
    } catch (error) {
        // Handle errors during user verification
        console.error("Verify user error: ", error);
        return res.status(401).send("Login verification failed");
    }
};


export const logoutUser = async (req: Request, res: Response) => {
    try {
        console.log("Logout user");
        const user = await getUser(res.locals.jwtData!.username);
        if (!user) {
            return res.status(404).send("User not found. Logout failed");
        }
        if (user.id !== res.locals.jwtData!.userId) {
            console.log("user.id", user.id, " | jwtData.userId", res.locals.jwtData!.userId);
            return res.status(401).send("Unauthorized");
        }

        res.clearCookie("auth_token" , {
            httpOnly: true,
            domain: "localhost",
            signed: true,
            path: "/",
        });

        return res.status(200).json({ message: "User logged out" });
    } catch (error) {
        console.error("Logout error ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};