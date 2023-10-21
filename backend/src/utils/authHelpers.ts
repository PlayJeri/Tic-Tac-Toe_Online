import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

/**
 * Validates a username for registration.
 *
 * @param {string} username - The username to be validated.
 * @returns {Promise<true | string>} - A promise that resolves to either 'true' if the username is valid or an error message if it's invalid.
 */
export const validateUsername = async (username: string): Promise<true | string> => {
    // Check if a user with the given username already exists in the database.
    const existingUser = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    // If the username already exists, return an error message.
    if (existingUser) {
        return "Username already taken";
    }

    // Regular expression to check if the username contains only letters, numbers, and underscores.
    const isValidChars = /^[a-zA-Z0-9_]+$/.test(username);

    // Checks username length is between 3 and 20 characters.
    const isValidLength = username.length >= 2 && username.length <= 20;

    // Return 'true' if the username is valid or an error message if it's invalid.
    return (isValidChars && isValidLength) || "Username can only contain letters and numbers";
}
