import { NextFunction, Response } from "express";
import { RequestCustom } from "./extensions";
import { secretKey } from "../controllers/authControllers";
import jwt from "jsonwebtoken";


export const validateTokenMiddleware = (req: RequestCustom, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Unauthorized - Token not provided" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized - Invalid token" });
        }

        req.decodedToken = decoded;

        next();
    })
}