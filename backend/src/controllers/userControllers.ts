import { Request, Response } from "express";
import { getUser, createPendingFriendship } from "../utils/prismaHelpers";


export const addFriendship = async (req: Request, res: Response) => {
    try {
        const { currentUserUsername, newFriendUsername } = req.body;

        const currentUser = await getUser(currentUserUsername);
        const newFriend = await getUser(newFriendUsername);

        if (!currentUser || !newFriend) {
            return res.status(404).json({ error: "User not found" });
        }

        const friendship = await createPendingFriendship(currentUser.id, newFriend.id);

        return res.sendStatus(201);
        
    } catch (error) {
        console.error("addFriendship error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}