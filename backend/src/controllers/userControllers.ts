import { Request, Response } from "express";
import { getUser, createPendingFriendship, acceptPendingFriendship, friendshipAlreadyExists, getPendingFriendRequests, getFriendships, deleteFriendshipFromDb } from "../utils/prismaHelpers";


export const addFriendship = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.status(404).send("Token data not found");

        // Extract username and id
        const { newFriendUsername } = req.body;
        const currentUserId = res.locals.jwtData.userId;

        // Fetch user object from database or send 404 status.
        const newFriend = await getUser(newFriendUsername);
        if (!newFriend) {
            return res.status(404).json({ error: "User not found" });
        }

        const friendshipExists = await friendshipAlreadyExists(currentUserId, newFriend.id);
        if (friendshipExists) {
            return res.status(400).send("Friendship already exists");
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
        if (!res.locals.jwtData) return res.status(404).send("Token data not found");

        // Extract username and id.
        const currentUserId = res.locals.jwtData.userId;
        const { friendId } = req.body;

        // Fetch user object from data or send 404 status.
        if (!friendId) return res.status(404).send("Friend Id not found");

        // Updates the pending friendship to accepted.
        await acceptPendingFriendship(currentUserId, friendId);

        return res.sendStatus(201);
    } catch (error) {
        console.error("accept friendship error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Fetch requesters pending friend requests.
 * @returns {PendingFriendRequest[] || 404 status} - List of requests or 404 if none are found.
 */
export const checkPendingFriendRequests = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.status(404).send("Token data not found");

        // Extract username and id.
        const currentUserId = res.locals.jwtData.userId;
        
        // Fetch the pending requests from database send 404 status if none found.
        const pendingRequests = await getPendingFriendRequests(currentUserId);
        if (!pendingRequests || pendingRequests.length === 0) {
            return res.status(404).send("No pending requests found");
        }

        // Return pending requests.
        return res.status(200).json(pendingRequests);
    } catch (error) {
        console.error("Check pending friend requests error:", error);
        return res.status(500).send("Internal Server Error");
    }
};


/**
 * Fetch all friendships of current user from database.
 * @returns {UserFriendship[], UserPendingFriendship[]} - All friendships of the current user
 */
export const getAllFriendships = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.status(404).send("Token data not found");

        const friendships = await getFriendships(res.locals.jwtData.userId);

        return res.status(200).json(friendships);
    } catch (error) {
        console.error("Get all friendships error:", error);
        return res.status(500).send("Internal Server Error");
    }
};


export const deleteFriendship = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.status(404).send("Token data not found");
        
        // Extract user IDs
        const currentUserId = res.locals.jwtData.userId;
        const { friendId } = req.body;

        // Delete the pending request from database. If request isn't found return 404 status.
        const pendingRequestDeleted = await deleteFriendshipFromDb(currentUserId, friendId);
        if (!pendingRequestDeleted) {
            return res.status(404).send("No pending friendship found");
        }

        return res.status(204).send("Pending request deleted");
    } catch (error) {
        console.error("Delete pending friend request error:", error);
        return res.status(500).send("Internal Server Error");
    }
};