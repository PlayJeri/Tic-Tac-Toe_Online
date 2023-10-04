import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { LoginRequestBody, RegisterRequestBody } from "../utils/types";
import { validateUsername } from "../utils/authHelpers";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
export const secretKey = process.env.SECRET_KEY!;


export const login = async (req: Request, res: Response) => {
    console.log('login');
    try {
        const { username, password }: LoginRequestBody = req.body;
        const user = await prisma.user.findFirst({ where: { username: username }});
        if (!user) {
            return res.status(404).json({
                error: "User with that username does not exist"
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }
        const tokenPayload = {
            userId: user.id,
            username: user.username
        }
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
        return res.status(200).json({
            message: "Login successful",
            token: token
        })
    } catch (error) {
        console.error('Login error: ', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, password2 }: RegisterRequestBody = req.body;
        if (!username) {
            return res.status(400).json({ error: "username is missing" });
        }
        if (!password || !password2 || password !== password2) {
            return res.status(400).json({ error: "passwords missing or did not match" });
        }
        const validUsername = await validateUsername(username);
        if (validUsername !== true) {
            return res.status(400).json({ error: validUsername });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username: username.trim().toLowerCase(),
                password: hashedPassword,
                wins: 0,
                losses: 0
            }
        })
        if (!user) {
            return res.status(500).json({ error: "User creation failed" });
        }

        return res.status(201).json({ success: `User: ${username.trim()} created` });

    } catch (error) {
        console.error('Register error: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const validateLogin = async (req: Request, res: Response) => {
    console.log("Login validated");
    return res.sendStatus(200);
}