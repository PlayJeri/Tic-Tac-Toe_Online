import { PrismaClient } from "@prisma/client";
import { MatchHistoryData, User, UserDatabase } from "./types";

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
 * Increment draw scores and time played on both users
 * @param {User} user1 - User object to update
 * @param {User} user2 - User object to update
 */
export async function addDraw(user1: User, user2: User) {
    try {
        // Get time played in seconds by subtracting connection starts time from current time.
        const user1TimePlayed = (Date.now() - user1.ws.connectionStartTime!) / 1000;
        const user2TimePlayed = (Date.now() - user2.ws.connectionStartTime!) / 1000;
        await prisma.user.update({
            where: {
                username: user1.username
            },
            data: {
                draws: {
                    increment: 1
                },
                timePlayedSeconds: {
                    increment: user1TimePlayed
                }
            }
        });
        await prisma.user.update({
            where: {
                username: user2.username
            },
            data: {
                draws: {
                    increment: 1
                },
                timePlayedSeconds: {
                    increment: user2TimePlayed
                }
            }
        }); 
    } catch(error) {
        console.error("Error updating draw scores", error);
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
 * @returns {Promise<true | undefined>} - True if record is created successfully else undefined
 */
export async function createMatchHistoryRecord(winner: UserDatabase, loser: UserDatabase, draw: boolean): Promise<true | undefined> {
    try {
        console.log("MATCH HISTORY", winner.username, loser.username, draw);
        await prisma.matches.create({
            data: {
                winnerId:       winner.id,
                winnerUsername: winner.username,
                loserId:        loser.id,
                loserUsername:  loser.username,
                draw:           draw,
            }
        });

        return true
    } catch (error) {
        console.error("Error creating match history record", error);
    }
};

/**
 * Fetches requesters match history by the userId
 * @param {number} userId - Id to search matches with
 * @returns {Promise<MatchHistoryData[] | undefined>}
 */
export async function getUserMatchHistory(userId: number): Promise<MatchHistoryData[] | undefined> {
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
                draw: true,
                matchTime: true,
            },
            orderBy: {
                matchTime: 'desc'
            },
            take: 50,
        });

        return matchHistory;
    } catch (error) {
        console.error("Error getting users match history", error);
    }
};

export async function friendshipAlreadyExists(user1Id: number, user2Id: number) {
    try {
       // Check if a friendship exists where user1 follows user2 or user2 follows user1
       const friendship = await prisma.friends.findFirst({
            where: {
                OR: [
                    {
                        followerId: user1Id,
                        followedId: user2Id,
                    },
                    {
                        followerId: user2Id,
                        followedId: user1Id,
                    },
                ],
            },
        });

        if (friendship) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Friendship exists fetch error:", error);
        return false;
    }
};