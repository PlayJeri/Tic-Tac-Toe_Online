import express, { Request, Response} from 'express';
import cors from 'cors';
import { websocketController } from './websocketController';
import { PrismaClient } from '@prisma/client';
import authRouter from './routers/authRouter';

const PORT = 3000;
const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
    res.send("Welcome to Tic Tac Toe Multiplayer!");
})

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

websocketController(server);

