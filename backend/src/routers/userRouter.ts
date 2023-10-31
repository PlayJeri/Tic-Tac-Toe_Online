import { Router } from "express";
import { validateTokenMiddleware } from "../utils/middleware";
import { acceptFriendshipRequest, addFriendship, checkPendingFriendRequests, deleteFriendship, getAllFriendships } from "../controllers/userControllers";

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

/**
 * @route /user/remove-friend
 * @description Decline pending request and remove it from database.
 */
userRouter.post('/remove-friend', deleteFriendship);

/**
 * @route /user/pending
 * @description Checks if pending requests exist in database and return them.
 */
userRouter.get('/pending', checkPendingFriendRequests);

/**
 * @route /user/friendships
 * @description Fetches all friendships of the requesting user.
 */
userRouter.get('/friendships', getAllFriendships);

export default userRouter;