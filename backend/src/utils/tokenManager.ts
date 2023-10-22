import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();


export const createToken = (id: number, username: string, expiresIn: string) => {
    const payload = { id, username };
    const token = jwt.sign(payload, process.env.SECRET_KEY!, {
        expiresIn,
    });
    return token;
};
