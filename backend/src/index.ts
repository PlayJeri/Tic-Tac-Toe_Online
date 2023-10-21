import express, { Request, Response } from 'express';
import cors from 'cors';
import { upgrade } from './websocketController';
import userRouter from './routers/userRouter';
import authRouter from './routers/authRouter';
import profileRouter from './routers/profileRouter';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const PORT = process.env.SERVER_PORT || 3000;
const app = express();

// CORS policy configurations
app.use(cors({ origin: process.env.CORS_ORIGINS || "*" }));

// Middleware
app.use(express.json());

// Routers
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/user', userRouter);

// Test endpoint (for development only)
app.get('/', (req: Request, res: Response) => {
    res.send("Welcome to Tic Tac Toe Multiplayer!");
})

// Start the Express server on specific PORT
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

// Pass the Express server to websocketController
upgrade(server);
