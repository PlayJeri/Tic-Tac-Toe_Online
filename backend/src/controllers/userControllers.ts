import { Request, Response } from "express";
import { getUser, createPendingFriendship, acceptPendingFriendship } from "../utils/prismaHelpers";


export const addFriendship = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.sendStatus(404).send("Token data not found");

        // Extract username and id
        const { newFriendUsername } = req.body;
        const currentUserId = res.locals.jwtData.userId;

        // Fetch user object from database or send 404 status.
        const newFriend = await getUser(newFriendUsername);
        if (!newFriend) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create pending friendship in database.
        await createPendingFriendship(currentUserId, newFriend.id);

        return res.sendStatus(201);

    } catch (error) {
        console.error("addFriendship error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Accepts pending friend request 
 */
export const acceptFriendshipRequest = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.sendStatus(404).send("Token data not found");

        // Extract username and id.
        const currentUserId = res.locals.jwtData.userId;
        const { requesterUsername } = req.body;

        // Fetch user object from data or send 404 status.
        const requester = await getUser(requesterUsername);
        if (!requester) return res.status(404).send("User not found");

        // Updates the pending friendship to accepted.
        await acceptPendingFriendship(currentUserId, requester.id);

        return res.sendStatus(201);
    } catch (error) {
        console.error("accept friendship error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
