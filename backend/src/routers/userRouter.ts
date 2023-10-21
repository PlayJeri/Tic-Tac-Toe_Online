import { Router } from "express";
import { validateTokenMiddleware } from "../utils/middleware";
import { acceptFriendshipRequest, addFriendship } from "../controllers/userControllers";

const userRouter = Router();

// Apply the token validation middleware for all routes in this endpoint.
userRouter.use(validateTokenMiddleware);

 /**
  * @route /user/follow
  * @description Creates a pending friend request.
  */
userRouter.post('/follow', addFriendship);

/**
 * @route /user/accept
 * @description Creates accepted friend request and changes pending request to accepted.
 */
userRouter.post('/accept', acceptFriendshipRequest);


export default userRouter;