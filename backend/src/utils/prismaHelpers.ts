import { PrismaClient } from "@prisma/client";
import { ConnectedUser } from "./types";

const prisma = new PrismaClient();

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

export async function addScores(winner: string, loser: string) {
    try {
        await prisma.user.update({
            where: {
                username: winner
            },
            data: {
                wins: {
                    increment: 1
                }
            }
        });
        await prisma.user.update({
            where: {
                username: loser
            },
            data: {
                losses: {
                    increment: 1
                }
            }
        });
    } catch (error) {
        console.error('Error updating scores:', error);
    }
}