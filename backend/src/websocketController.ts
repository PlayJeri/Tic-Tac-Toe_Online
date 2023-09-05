import WebSocket, { WebSocketServer } from "ws";
import jwt, { verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Server as HttpServer, IncomingMessage } from 'http';
import { MessageType } from "./utils/clientMessages";
import { ConnectedUser, NewMove } from "./utils/types";
import { Room } from "./utils/Room";
import { addScores } from "./utils/prismaHelpers";
dotenv.config();

const secretKey = process.env.SECRET_KEY!;

const wss = new WebSocketServer({ noServer: true });

const connectedUsers: ConnectedUser[] = [];
const rooms: Room[] = [];

wss.on('connection', function connection(ws: WebSocket, request: IncomingMessage, client: any) {
    console.log('connection');
    ws.on('error', console.error);
    ws.on('message', (data: string) => {
        handleIncomingMessage(data, ws);
    });
    ws.on('close', () => {
        handleClose(ws);
    })
})

const handleIncomingMessage = (data: string, ws: WebSocket) => {
    console.log("data", data.toString());
    try {
        const { type } = JSON.parse(data);
        switch(type) {
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
                console.log("Unknown message type: ", type);
                break;
        }
    } catch (error) {
        console.error('Error processing message: ', error);
    }
}

export function upgrade(server: HttpServer) {
    server.on('upgrade', (request, socket, head) => {
        console.log('upgrade');
        socket.on('error', onSocketError);
    
        const token = request.url?.split('?')[1]?.split('=')[1];
    
        if (!token) {
            console.error("No token found");
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
    
        try {
            const client = jwt.verify(token, secretKey);
        
            socket.removeListener('error', onSocketError);
        
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request, client);
            })
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.error('Token has expired:', error.message)
            } else {
                console.error('Token verification failed', error);
            }
        }
    })
}


function onSocketError(err: Error): void {
    console.error(err);
}

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
    const { username } = JSON.parse(data).payload;
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
        const loser = roomUsers.find(user => user.username !== winner);
        if (winner) {
            console.log('winner');
            addScores(winner, loser!.username)
        }
        
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

