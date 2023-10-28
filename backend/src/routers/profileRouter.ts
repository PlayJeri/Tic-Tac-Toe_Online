import { Router } from "express";
import { validateTokenMiddleware } from "../utils/middleware";
import { changePassword, getProfile, getMatchHistory } from "../controllers/profileControllers";

const profileRouter = Router();

// Apply the token validation middleware for all routes in this endpoint.
profileRouter.use(validateTokenMiddleware);

/**
 * @route /profile/
 * @description Returns information of a specific user.
 */
profileRouter.get('/', getProfile);

/**
 * @route /profile/password
 * @description Changes the password of a specific user.
 */
profileRouter.post('/password', changePassword);

/**
 * @route /profile/match-history
 * @description Gets requesting users match history.
 */
profileRouter.get('/match-history', getMatchHistory);

export default profileRouter;