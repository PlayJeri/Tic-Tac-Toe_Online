import { User } from "./types";

export class Room {
    name: string;
    users: User[];
    gameState: (string | null)[];
    lastIndex: number | null;
    nextChar: string;
    currentTurn: string;
    playAgain: string[];

    constructor(users: User[]) {
        this.users = users;
        this.gameState = Array(9).fill(null);
        this.currentTurn = users[Math.floor(Math.random() * 2)].username || '';
        this.name = `${users[0].username}+${users[1].username}` || "random";
        this.lastIndex = null;
        this.nextChar = Math.floor(Math.random() * 2) == 1 ? "X" : "O";
        this.playAgain = [];
    }

    setGameState(index: string) {
        this.gameState[parseInt(index)] = this.nextChar
        this.nextChar = this.nextChar === "X" ? "O" : "X";
        this.lastIndex = parseInt(index);
        this.currentTurn = this.users.find(user => user.username !== this.currentTurn)?.username || '';
        console.log(this.gameState);
    }

    checkDraw(): boolean {
        return !this.gameState.includes(null);
    }

    calculateWinner(connectedUser: User): User | null {
        const username = connectedUser.username;
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