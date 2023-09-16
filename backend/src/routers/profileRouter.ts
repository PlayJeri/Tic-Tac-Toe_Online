import { Router } from "express";
import { validateTokenMiddleware } from "../utils/middleware";
import { getProfile } from "../controllers/profileControllers";

const profileRouter = Router();

profileRouter.get('/', validateTokenMiddleware, getProfile);


export default profileRouter;