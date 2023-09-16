import { Request } from "express";
import jwt from 'jsonwebtoken';

export interface RequestCustom extends Request {
    decodedToken?: string | jwt.JwtPayload | undefined;
}