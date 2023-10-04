import { Router } from "express";
import { login, register, validateLogin } from "../controllers/authControllers";
import { validateTokenMiddleware } from "../utils/middleware";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/validate', validateTokenMiddleware, validateLogin);

export default authRouter;