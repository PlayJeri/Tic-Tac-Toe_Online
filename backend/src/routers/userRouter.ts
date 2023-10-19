import { Router } from "express";
import { validateTokenMiddleware } from "../utils/middleware";
import { acceptFriendshipRequest, addFriendship } from "../controllers/userControllers";

const userRouter = Router();

userRouter.post('/follow', validateTokenMiddleware, addFriendship);
userRouter.post('/accept', validateTokenMiddleware, acceptFriendshipRequest);


export default userRouter;