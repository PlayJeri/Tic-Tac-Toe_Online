import { Request, Response } from "express";
import { getUser, createPendingFriendship, acceptPendingFriendship } from "../utils/prismaHelpers";


export const addFriendship = async (req: Request, res: Response) => {
    try {
        const { newFriendUsername } = req.body;
        const currentUserId = res.locals.jwtData?.userId;
        if (!currentUserId) return res.status(404).json({ error: "User ID not found on token" });

        const newFriend = await getUser(newFriendUsername);

        if (!currentUserId || !newFriend) {
            return res.status(404).json({ error: "User not found" });
        }

        await createPendingFriendship(currentUserId, newFriend.id);

        return res.sendStatus(201);

    } catch (error) {
        console.error("addFriendship error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


export const acceptFriendshipRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = res.locals.jwtData?.userId;
        if (!currentUserId) return res.status(404).json({ error: "User ID not found on token" });
        const { requesterUsername } = req.body;

        const requester = await getUser(requesterUsername);

        if (!requester) return res.status(404).json({ error: "Username not found" });

        await acceptPendingFriendship(currentUserId, requester.id);

        return res.sendStatus(201);

    } catch (error) {
        console.error("accept friendship error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
