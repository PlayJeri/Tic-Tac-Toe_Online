import { WebSocketServer, WebSocket } from "ws";
import dotenv from 'dotenv';
import { Server as HttpServer, IncomingMessage } from 'http';
import { MessageType } from "./utils/clientMessages";
import { User, NewMove, DecodedAccessToken } from "./utils/types";
import { Room } from "./utils/Room";
import { acceptPendingFriendship, addScores, createPendingFriendship, getUser } from "./utils/prismaHelpers";

// Load environment variables
dotenv.config();
const secretKey = process.env.SECRET_KEY!;

// Initialize new web socket server
const wss = new WebSocketServer({ noServer: true });

// Arrays to store connected users, queued users and game rooms.
const connectedUsers: User[] = [];
const queuedUsers: User[] = [];
const rooms: Room[] = [];

// WebSocket server connection event
wss.on('connection', function connection(ws: WebSocket, request: IncomingMessage, client: any) {
    
    // Handle WebSocket errors
    ws.on('error', console.error);

    // Handle WebSocket messages
    ws.on('message', (data: string) => {
        handleIncomingMessage(data, ws);
    });

    // Handle WebSocket closing
    ws.on('close', () => {
        const data = {
            type: "DISCONNECTED",
            payload: {
                winner: null,
            }
        }
        handleClose(ws, JSON.stringify(data));
    })
})

/**
 * Handle incoming WebSocket messages.
 * 
 * @param {string} data - Incoming data as a string.
 * @param {WebSocket} ws - The WebSocket connection.
 */
const handleIncomingMessage = (data: string, ws: WebSocket) => {
    console.log("data", data.toString());
    try {
        // Determine messages type and call the corresponding handler function.
        const { type } = JSON.parse(data);
        switch(type) {
            case MessageType.NEW_USER:
                handleNewUserMessage(ws, data);
                break;
            case MessageType.QUEUE_USER:
                handleQueueUserMessage(ws, data);
                break;
            case MessageType.NEW_MOVE:
                handleNewMoveMessage(ws, data);
                break;
            case MessageType.RESET_GAME:
                handleResetGame(ws, data);
                break;
            case MessageType.CHAT_MESSAGE:
                handleChatMessage(ws, data);
                break;
            case MessageType.FRIEND_REQUEST:
                handleFriendRequestMessage(ws, data);
                break;
            case MessageType.REQUEST_ACCEPTED:
                handleAcceptFriendRequest(ws, data);
                break;
            case MessageType.DISCONNECTED:
                handleDisconnectionFromGame(ws, data);
                break;
            default:
                console.log("Unknown message type: ", type);
                break;
        }
    } catch (error) {
        console.error('Error processing message: ', error);
    }
}

/**
 * Upgrades a provided server to a WebSocket server to enable WebSocket connections.
 * 
 * @param {HttpServer} server - The server to connect the WebSocket controller to.
 */
export function upgrade(server: HttpServer) {
    server.on('upgrade', (request, socket, head) => {
        socket.on('error', onSocketError);
        try {
            socket.removeListener('error', onSocketError);
        
            // Upgrade the connection to a WebSocket connection.
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            })
        } catch (error) {
            console.error('Connection upgrade failed:', error);
        }
    })
}

/**
 * Handles and logs errors that might occur in socket upgrade.
 * 
 * @param {Error} err - The error to be logged.
 */
function onSocketError(err: Error): void {
    console.error(err);
}

/**
 * Handles the closing of a WebSocket connection.
 * 
 * @param {WebSocket} ws - WebSocket connection that has been closed.
 */
const handleClose = (ws: WebSocket, data: string) => {
    // Find and remove the disconnected user from connected users.
    const userIndexConnected = connectedUsers.findIndex(user => user.ws === ws);
    if (userIndexConnected !== -1) {
        connectedUsers.splice(userIndexConnected, 1);
    }

    // Find and remove the disconnected user from queued users.
    const userIndexQueued = queuedUsers.findIndex(user => user.ws === ws);
    if (userIndexQueued !== -1) {
        const username = queuedUsers[userIndexQueued].username;
        queuedUsers.splice(userIndexQueued, 1);
    }

    // Handles disconnection from game if user is in one.
    handleDisconnectionFromGame(ws, data);
}

/**
 * Handles a new user type message, and sends confirmation message if successful.
 * 
 * @param {WebSocket} ws - WebSocket connection of the new user.
 * @param {String} data - Stringified JSON containing user data.
 * @returns 
 */
const handleNewUserMessage = (ws: WebSocket, data: string) => {
    // Parse the JSON data to extract the username.
    const { username } = JSON.parse(data).payload;

    // Checks if the user is already on the connected list. If so return early, else add user to the list. 
    const userAlreadyConnected = connectedUsers.some(user => user.ws === ws && user.username === username);
    if (userAlreadyConnected) return;
    connectedUsers.push({ ws, username });

    // Confirmation message for the new user.
    const connectedMessage = {
        type: 'CONNECTED',
        message: {
            message: 'Connected successfully!!'
        }
    }

    // Stringify and send the message to the new user.
    ws.send(JSON.stringify(connectedMessage));
}


/**
 * Handles a queue user type message by adding the user to queue and starting a game if opponent if found.
 *
 * @param {WebSocket} ws - WebSocket connection of the user sending the message.
 * @param {string} data - JSON string containing username.
 */
const handleQueueUserMessage = (ws: WebSocket, data: string) => {
    // Parse the JSON data to extract the username.
    const { username } = JSON.parse(data).payload;

    // Check if the user is already queued. If so return early.
    const userAlreadyQueued = queuedUsers.some(user => user.ws === ws || user.username === username);
    if (userAlreadyQueued) return;

    // Add current time to connection for tracking how long users play.
    const connectionStartTime = Date.now();
    ws.connectionStartTime = connectionStartTime;

    // Add the user to the list of queued users.
    queuedUsers.push({ ws, username: username });

    // Check if there are enough users in the queue to start a game.
    if (queuedUsers.length >= 2) {
        // Create a room with the first two users from the queue.
        const roomUsers = queuedUsers.splice(0, 2);
        const room = new Room(roomUsers);
        rooms.push(room);

        // Notify the users in the room that the game is starting.
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

            // Add current time to connection for tracking how long users play.
            const connectionStartTime = Date.now();
            ws.connectionStartTime = connectionStartTime;
        });
    }
}


const handleNewMoveMessage = async (ws: WebSocket, data: string) => {
    const { roomName, index, username }: NewMove = JSON.parse(data).payload;
    const roomToUpdate = rooms.find(room => room.name === roomName);

    if (roomToUpdate) {
        roomToUpdate.setGameState(index);
        const roomUsers = roomToUpdate.users;
        const user = roomUsers.find(user => user.username === username);
        const winner = roomToUpdate.calculateWinner(user!)
        const draw = roomToUpdate.checkDraw();
        if (winner) {
            const loser = roomUsers.find(user => user.username !== username);
            console.log('winner', winner.username, "Loser: ", loser?.username);
            addScores(winner, loser!)
        }
        
        roomUsers.forEach(user => {
            const message = {
                type: 'GAME_UPDATED',
                message: {
                    playerTurn: roomToUpdate.currentTurn,
                    gameState: roomToUpdate.gameState,
                    lastIndex: roomToUpdate.lastIndex,
                    nextCharacter: roomToUpdate.nextChar,
                    winner: winner?.username,
                    draw: draw
                }
            }
            user.ws.send(JSON.stringify(message));
        })
    }  
}

const handleResetGame = (ws: WebSocket, data: string) => {
    const { username, roomName } = JSON.parse(data).payload;
    const roomToUpdate = rooms.find(room => room.name === roomName);

    if (roomToUpdate) {
        const reset = roomToUpdate.resetGame(username);
        const roomUsers = roomToUpdate.users;
        if (reset) {
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
                user.ws.connectionStartTime = Date.now();
            })
        } else {
            const messageReceiver = roomUsers.find(user => user.username !== username);
            const message = {
                type: 'PLAY_AGAIN',
                message: {
                    username: username,
                    text: `${username} wants to play again!`
                }
            };
            messageReceiver?.ws.send(JSON.stringify(message));
        }
    }
}

const handleChatMessage = (ws: WebSocket, data: string) => {
    const { newMessage, roomName, username } = JSON.parse(data).payload;
    const chatRoom = rooms.find(room => room.name === roomName);

    if (chatRoom) {
        const roomUsers = chatRoom.users;

        roomUsers.forEach(user => {
            const message = {
                type: 'CHAT_MESSAGE',
                message: {
                    message: newMessage,
                    username: username
                }
            }
            user.ws.send(JSON.stringify(message));
        })
    }
}

export const handleFriendRequestMessage = async (ws: WebSocket, data: string) => {

    const { roomName, username } = JSON.parse(data).payload;
    const room = rooms.find(room => room.name === roomName)
    if (!room) return;

    const message = {
        type: 'FRIEND_REQUEST',
        message: {
            message: `${username} want to add you as a friend!`,
            user: username
        }
    }
    const friend = room.users.find(user => user.username !== username);
    if (!friend) return;
    console.log('message sent to ', friend.username);
    friend.ws.send(JSON.stringify(message));

    const user = await getUser(username);
    const friendUser = await getUser(friend.username);

    if (!user || !friendUser) return;

    createPendingFriendship(user.id, friendUser.id);
}


const handleDisconnectionFromGame = async (ws: WebSocket, data: string) => {
    const { winner } = JSON.parse(data).payload;
    console.log(`Winner IS ${winner}`)

    const userIndex = queuedUsers.findIndex(user => user.ws === ws);
    if (userIndex !== -1) { queuedUsers.splice(userIndex, 1) };

    const roomIndex = rooms.findIndex(room => room.users[0].ws === ws || room.users[1].ws === ws);
    const roomUsers = rooms[roomIndex]?.users
    if (roomIndex !== -1) {
        console.log("number of rooms = ", rooms.length)

        const disconnectedUser = roomUsers.find(user => user.ws === ws);
        const otherUser = roomUsers.find(user => user.ws !== ws);

        const opponentDisconnectedMessage = {
            type: 'OPPONENT_DISCONNECTED'
        }

        otherUser?.ws.send(JSON.stringify(opponentDisconnectedMessage));

        rooms.splice(roomIndex, 1);

        console.log("number of rooms = ", rooms.length);
        console.log('room closed');

        if (otherUser && disconnectedUser && winner) {
            addScores(otherUser, disconnectedUser);
        }
    }
};

const handleAcceptFriendRequest = async (ws: WebSocket, data: string) => {
    const { username, friendUsername } = JSON.parse(data).payload;
    if (!username || !friendUsername) return;

    const user = await getUser(username);
    const friend = await getUser(friendUsername);
    if (!user || !friend) return;

    acceptPendingFriendship(user.id, friend.id);
}