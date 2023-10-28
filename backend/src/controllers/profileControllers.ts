import { Request, Response } from "express"
import { getUser, getUserMatchHistory, updateUserPassword } from "../utils/prismaHelpers";
import bcrypt from 'bcrypt';


/**
 * current users profile data from database.
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.sendStatus(404).send("Token data not found");
    
        // Extract username from jwt data.
        const username = res.locals.jwtData.username;
    
        // Get user object from data base or send 404 status.
        const user = await getUser(username);
        if (!user) {
            return res.sendStatus(404);
        }
    
        // Return needed info from user object and 200 status
        return res.status(200).json({
            username: user.username,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            secondsPlayed: user.timePlayedSeconds
        });
    } catch (error) {
        console.error("Error getting profile data:", error);
    }
}


/**
 * Changes requesters password
 */
export const changePassword = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.sendStatus(404).send("Token data not found");

        // Extract username and passwords
        const { password, newPassword } = req.body;
        const username = res.locals.jwtData.username

        // If passwords are not provided send 400 status
        if (!password || !newPassword) return res.status(400).send("Password not provided");
    
        // Get user object from database or send 404 status
        const user = await getUser(username);
        if (!user) return res.status(404).send("User not found");
    
        // Verify the password against user objects hashed password if fails send 401 status.
        const verifiedPassword = await bcrypt.compare(password, user.password);
        if (!verifiedPassword) return res.sendStatus(401);
    
        // Hash the new password and update it in database.
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(username, newPasswordHash);

        return res.sendStatus(200);
    } catch (error) {
        console.error("Password change failed: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Gets requester match history from database.
 */
export const getMatchHistory = async (req: Request, res: Response) => {
    try {
        // Makes sure jwtData exists or send 404 status
        if (!res.locals.jwtData) return res.sendStatus(404).send("Token data not found");

        // Extract users id
        const currentUserId = res.locals.jwtData.userId;

        // Fetch the match history from database or send 404 status
        const matchHistory = await getUserMatchHistory(currentUserId);
        if (!matchHistory) {
            return res.status(404).send("No match history found.");
        }

        return res.status(200).json(matchHistory);
    } catch (error) {
        console.error("Error in matchHistory controller", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};