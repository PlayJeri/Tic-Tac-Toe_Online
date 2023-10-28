import { PrismaClient } from "@prisma/client";
import { User, UserDatabase } from "./types";

// Create a Prisma client instance.
const prisma = new PrismaClient();


/**
 * Update a user's password in the database.
 * @param {string} username - The username of the user.
 * @param {string} newHashedPassword - The new hashed password to be set for the user.
 * @returns {Promise<Error | null>} - Returns null on success, an Error object on failure.
 */
export async function updateUserPassword(username: string, newHashedPassword: string): Promise<Error | null> {
    try {
        await prisma.user.update({
            where: {
                username: username
            },
            data: {
                password: newHashedPassword
            }
        });
        return null;
    } catch (error: any) {
        console.error(error);
        return error;
    }
}

/**
 * Get a user's information by their username.
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<UserDatabase | null>} - Returns the user object on success, null on failure.
 */
export async function getUser(username: string): Promise<UserDatabase | null> {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                username: username
            }
        });
        return user
    } catch (error) {
        console.error('Error finding user:', error);
        return null
    }
}

/**
 * Update user scores and time played for a winner and loser.
 * @param {User} winner - The user who won.
 * @param {User} loser - The user who lost.
 */
export async function addScores(winner: User, loser: User) {
    try {
        const winnerTimePlayed = (Date.now() - winner.ws.connectionStartTime!) / 1000;
        const loserTimePlayed = (Date.now() - loser.ws.connectionStartTime!) / 1000;
        await prisma.user.update({
            where: {
                username: winner.username
            },
            data: {
                wins: {
                    increment: 1
                },
                timePlayedSeconds: {
                    increment: winnerTimePlayed
                }
            }
        });
        await prisma.user.update({
            where: {
                username: loser.username
            },
            data: {
                losses: {
                    increment: 1
                },
                timePlayedSeconds: {
                    increment: loserTimePlayed
                }
            }
        });
    } catch (error) {
        console.error('Error updating scores:', error);
    }
}

/**
 * Create a pending friendship between two users.
 * @param {number} currentUserId - The ID of the current user initiating the friendship.
 * @param {number} newFriendId - The ID of the user to befriend.
 * @returns {Promise<Error | null>} - Returns null on success, an Error object on failure.
 */
export async function createPendingFriendship(currentUserId: number, newFriendId: number): Promise<Error | null> {
    try {
        const friendship = await prisma.friends.create({
            data: {
                followerId: currentUserId,
                followedId: newFriendId,
                status: 'pending',
            },
        });
        
        return null
    } catch (error: any) {
        return error
    }
}

/**
 * Accept a pending friendship request.
 * @param {number} currentUserId - The ID of the current user accepting the friendship request.
 * @param {number} requesterId - The ID of the user who sent the request.
 * @returns {Promise<Error | null>} - Returns null on success, an Error object on failure.
 */
export async function acceptPendingFriendship(currentUserId: number, requesterId: number): Promise<Error | null> {
    try {
        const acceptedFriendship = await prisma.friends.update({
            data: {
                status: 'accepted'
            },
            where: {
                followerId_followedId: {
                    followerId: requesterId,
                    followedId: currentUserId
                }
            }
        });

        const followBackFriendship = await prisma.friends.create({
            data: {
                followerId: currentUserId,
                followedId: requesterId,
                status: 'accepted'
            }
        });

        return null;
    } catch (error: any) {
        console.error("accept friendship error: ", error);
        return error;
    }
}

/**
 * Creates database record with match time and ids + usernames of players
 * @param {UserDatabase} winner - User object from database
 * @param {UserDatabase} loser - User object from database
 * @returns - True if record is created successfully else void
 */
export async function createMatchHistoryRecord(winner: UserDatabase, loser: UserDatabase): Promise<true | undefined> {
    try {
        await prisma.matches.create({
            data: {
                winnerId:       winner.id,
                winnerUsername: winner.username,
                loserId:        loser.id,
                loserUsername:  loser.username,
            }
        });

        return true
    } catch (error) {
        console.error("Error creating match history record", error);
    }
};


export async function getUserMatchHistory(userId: number) {
    try {
        const matchHistory = await prisma.matches.findMany({
            where: {
                OR: [
                    { winnerId : userId },
                    { loserId : userId }
                ]
            },
            select: {
                winnerUsername: true,
                loserUsername: true,
                matchTime: true,
            }
        })

        return matchHistory;
    } catch (error) {
        console.error("Error getting users match history", error);
        return false
    }
};