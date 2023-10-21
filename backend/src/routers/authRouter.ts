import { Router } from "express";
import { login, register, validateLogin } from "../controllers/authControllers";
import { validateTokenMiddleware } from "../utils/middleware";

const authRouter = Router();

/**
 * @route POST /auth/login
 * @description Logic for logging in a user.
 */
authRouter.post('/login', login);

/**
 * @route POST /auth/register
 * @description Logic for registering a new user.
 */
authRouter.post('/register', register);

/**
 * @route POST /auth/validate
 * @description Checks if user if logged in.
 * @middleware Validates users authentication token.
 */
authRouter.post('/validate', validateTokenMiddleware, validateLogin);

export default authRouter;