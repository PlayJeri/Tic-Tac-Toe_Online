import { Response } from "express"
import { RequestCustom } from "../utils/extensions";
import { getUser } from "../utils/prismaHelpers";
import { userData } from "../utils/types";
import jwt from "jsonwebtoken";


export const getProfile = async (req: RequestCustom, res: Response) => {
    const { username } = req.decodedToken as userData;

    const user = await getUser(username);
    if (!user) {
        return res.sendStatus(404);
    }

    return res.status(200).json({
        username: user.username,
        wins: user.wins,
        losses: user.losses
    });
}