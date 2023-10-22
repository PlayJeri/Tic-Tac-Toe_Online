import { Request, Response } from "express"
import { getUser, updateUserPassword } from "../utils/prismaHelpers";
import { DecodedAccessToken, tokenPayload } from "../utils/types";
import bcrypt from 'bcrypt';


export const getProfile = async (req: Request, res: Response) => {
    const tokenPayload = res.locals.jwtData as tokenPayload;

    const user = await getUser(tokenPayload.username);
    if (!user) {
        return res.sendStatus(404);
    }

    return res.status(200).json({
        username: user.username,
        wins: user.wins,
        losses: user.losses,
        secondsPlayed: user.timePlayedSeconds
    });
}

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { password, newPassword } = req.body;
        const { username } = req.decodedToken;
    
        const user = await getUser(username);
        if (!user) return res.sendStatus(404);
    
        if (!password || !newPassword) return res.sendStatus(400);
    
        const verifiedPassword = await bcrypt.compare(password, user.password);
        if (!verifiedPassword) return res.sendStatus(401);
    
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.password = newPasswordHash
    
        const passwordChangedSuccessfully = await updateUserPassword(username, newPassword);

        return res.sendStatus(200);
    } catch (error) {
        console.error("Password change failed: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}