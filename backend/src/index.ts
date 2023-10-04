import express, { Request, Response } from 'express';
import cors from 'cors';
import { upgrade } from './websocketController';
import { PrismaClient } from '@prisma/client';
import authRouter from './routers/authRouter';
import profileRouter from './routers/profileRouter';

const PORT = 3000;
const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use('/auth', authRouter);
app.use('/profile', profileRouter);

app.get('/', (req: Request, res: Response) => {
    res.send("Welcome to Tic Tac Toe Multiplayer!");
})

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

upgrade(server);

