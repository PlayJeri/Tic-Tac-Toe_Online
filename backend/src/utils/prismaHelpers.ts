import { PrismaClient } from "@prisma/client";
import { ConnectedUser } from "./types";

const prisma = new PrismaClient();

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
        return null
    } catch (error: any) {
        console.error(error);
        return error       
    }
}


export async function getUser(username: string) {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                username: username
            }
        })
        return user
    } catch (error) {
        console.error('Error finding user:', error);
    }
}

export async function addScores(winner: ConnectedUser, loser: ConnectedUser) {
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

