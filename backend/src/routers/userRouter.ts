import { Router } from "express";
import { validateTokenMiddleware } from "../utils/middleware";

const userRouter = Router();

userRouter.post('/follow', validateTokenMiddleware);