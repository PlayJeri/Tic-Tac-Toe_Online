import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();


export const createToken = (userId: number, username: string, expiresIn: string) => {
    const payload = { userId, username };
    const token = jwt.sign(payload, process.env.SECRET_KEY!, {
        expiresIn,
    });
    console.log("Token:", token); 
    return token;
};
