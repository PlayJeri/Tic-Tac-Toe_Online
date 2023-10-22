import { User } from "./types";

/**
 * Room for a game of Tic-Tac-Toe.
 */
export class Room {
    name: string;
    users: User[];
    gameState: (string | null)[];
    lastIndex: number | null;
    nextChar: string;
    currentTurn: string;
    playAgain: string[];

    /**
     * Creates a new room with provided users and starts the game with random user starting
     * @param users - The two users playing in this room.
     */
    constructor(users: User[]) {
        this.users = users;
        this.gameState = Array(9).fill(null);
        this.currentTurn = users[Math.floor(Math.random() * 2)].username || '';
        this.name = `${users[0].username}+${users[1].username}` || "random";
        this.lastIndex = null;
        this.nextChar = Math.floor(Math.random() * 2) == 1 ? "X" : "O";
        this.playAgain = [];
    }

    /**
     * Set the game state for specified index.
     * @param index - One of the nine squares of the game board.
     */
    setGameState(index: string) {
        this.gameState[parseInt(index)] = this.nextChar
        this.nextChar = this.nextChar === "X" ? "O" : "X";
        this.lastIndex = parseInt(index);
        this.currentTurn = this.users.find(user => user.username !== this.currentTurn)?.username || '';
        console.log(this.gameState);
    }

    /**
     * Checks if the game has ended in a draw.
     * @returns {boolean} - True if the game is a draw, false otherwise.
     */
    checkDraw(): boolean {
        return !this.gameState.includes(null);
    }

    /**
     * Checks if the current game state has a winner.
     * @param connectedUser - User with current turn
     * @returns {User | null} - The winning user or null if there is no winner yet.
     */
    calculateWinner(connectedUser: User): User | null {
        const winningLines: number[][] = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        for (const line of winningLines) {
            const [a, b, c] = line;
            if (this.gameState[a] && this.gameState[a] === this.gameState[b] && this.gameState[a] === this.gameState[c]) {
                return connectedUser;
            }
        }
        return null;
    }

    /**
     * Resets the game for a new round.
     * @param username - The username of the user requesting a new round.
     * @returns {boolean} - True if the game resets, false otherwise
     */
    resetGame(username: string): boolean {
        if (this.playAgain.includes(username)) return false;
        this.playAgain.push(username);
        if (this.playAgain.length < 2) return false;
        this.gameState = Array(9).fill(null);
        this.currentTurn = this.users[Math.floor(Math.random() * 2)].username || '';
        this.lastIndex = null;
        this.nextChar = Math.floor(Math.random() * 2) == 1 ? "X" : "O";
        this.playAgain = [];
        return true;
    }
}