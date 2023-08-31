import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const validateUsername = async (username: string): Promise<true | string> => {
    const existingUser = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (existingUser) {
        return "Username already taken"
    }
    const isValid = /^[a-zA-Z0-9_]+$/.test(username);
    return isValid || "Username can only contain letters and numbers";
}