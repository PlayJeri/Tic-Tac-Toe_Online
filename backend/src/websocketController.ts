import WebSocket from "ws";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Server as HttpServer, IncomingMessage } from 'http';
import { MessageType } from "./utils/clientMessages";
import { ConnectedUser, NewMove } from "./utils/types";
import { Room } from "./utils/Room";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const secretKey = process.env.SECRET_KEY!;
const prisma = new PrismaClient();


export const websocketController = (server: HttpServer) => {
    const wss = new WebSocket.Server({ server })
    const connectedUsers: ConnectedUser[] = [];
    const rooms: Room[] = [];

    wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
        // TODO: Connection auth login still untested
        const token = request.headers['authorization'];
        if (token === undefined) {
            ws.close(4001, "Unauthorized: No token provided");
            return;
        }
        jwt.verify(token, secretKey, (err) => {
            if (err) {
                ws.close(4002, "Unauthorized: Invalid token");
                return
            }
        })
        // 
        console.log("New connection established.");

        ws.on('message', (data: string) => {
            try {
                const { messageType } = JSON.parse(data);
                switch(messageType) {
                    case MessageType.NEW_USER:
                        handleNewUserMessage(ws, data);
                        break;
                    case MessageType.NEW_MOVE:
                        handleNewMoveMessage(ws, data);
                        break;
                    case MessageType.RESET_GAME:
                        handleResetGame(ws, data);
                        break;
                    default:
                        console.log("Unknown message type: ", messageType);
                        break;
                }
            } catch (error) {
                console.error('Error processing message: ', error);
            }
        });

        ws.on('close', () => {
            handleClose(ws)
        })
    })

    const handleClose = (ws: WebSocket) => {
        console.log("WebSocket connection closed");
    
        const userIndex = connectedUsers.findIndex(user => user.ws === ws);
        if (userIndex !== -1) {
            const username = connectedUsers[userIndex].username;
            console.log(`User disconnected" ${username}`)
            connectedUsers.splice(userIndex, 1);
        }
    }

    const handleNewUserMessage = (ws: WebSocket, data: string) => {
        const { username } = JSON.parse(data);
        console.log(username, "joined");
        connectedUsers.push({ ws, username: username });

        if (connectedUsers.length >= 2) {
            const roomUsers = connectedUsers.splice(0, 2);
            const room = new Room(roomUsers);
            rooms.push(room);
            console.log('New room created');

            roomUsers.forEach(user => {
                const startMessage = {
                    type: 'START_GAME',
                    message: {
                        roomName: room.name,
                        starter: room.currentTurn,
                        gameState: room.gameState,
                        nextCharacter: room.nextChar
                    }
                };
                user.ws.send(JSON.stringify(startMessage));
            })
        }
    }

    const handleNewMoveMessage = async (ws: WebSocket, data: string) => {
        const { roomName, index, username }: NewMove = JSON.parse(data).message;
        const roomToUpdate = rooms.find(room => room.name === roomName);

        if (roomToUpdate) {
            roomToUpdate.setGameState(index);
            const roomUsers = roomToUpdate.users;
            const winner = roomToUpdate.calculateWinner(username)
            // TODO: Winner / Loser login still untested
            if (winner) {
                const updatedWinner = await prisma.user.update({
                    where: {
                        username: username
                    },
                    data: {
                        wins: {
                            increment: 1
                        }
                    }
                });
                const loser = roomUsers.find(user => user.username !== winner);
                const updatedLoser = await prisma.user.update({
                    where: {
                        username: loser?.username
                    },
                    data: {
                        losses: {
                            increment: 1
                        }
                    }
                });
            }
            // 
            roomUsers.forEach(user => {
                const message = {
                    type: 'GAME_UPDATED',
                    message: {
                        playerTurn: roomToUpdate.currentTurn,
                        gameState: roomToUpdate.gameState,
                        lastIndex: roomToUpdate.lastIndex,
                        nextCharacter: roomToUpdate.nextChar,
                        winner: winner
                    }
                }
                user.ws.send(JSON.stringify(message));
            })
        }  
    }

    const handleResetGame = (ws: WebSocket, data: string) => {
        const { username, roomName } = JSON.parse(data).message;
        const roomToUpdate = rooms.find(room => room.name === roomName);

        if (roomToUpdate) {
            const reset = roomToUpdate.resetGame(username);
            if (reset) {
                const roomUsers = roomToUpdate.users;

                roomUsers.forEach(user => {
                    const message = {
                        type: 'GAME_RESET',
                        message: {
                            starter: roomToUpdate.currentTurn,
                            gameState: roomToUpdate.gameState,
                            lastIndex: roomToUpdate.lastIndex,
                            nextCharacter: roomToUpdate.nextChar,  
                        }
                    }
                    user.ws.send(JSON.stringify(message));
                })
            }
        }
    }
}