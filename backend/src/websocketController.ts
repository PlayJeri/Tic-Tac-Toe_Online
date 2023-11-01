import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer, IncomingMessage } from 'http';
import { MessageType } from "./utils/clientMessages";
import { User, NewMove } from "./utils/types";
import { Room } from "./utils/Room";
import { acceptPendingFriendship, addDraw, addScores, createMatchHistoryRecord, createPendingFriendship, friendshipAlreadyExists, getUser } from "./utils/prismaHelpers";


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
        handleClose(ws);
    })
})

/**
 * Handle incoming WebSocket messages.
 * 
 * @param {string} data - Incoming data as a string.
 * @param {WebSocket} ws - The WebSocket connection.
 */
const handleIncomingMessage = (data: string, ws: WebSocket) => {
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
                handleDisconnectionFromGame(ws);
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
const handleClose = (ws: WebSocket) => {
    // Find and remove the disconnected user from connected users.
    const userIndexConnected = connectedUsers.findIndex(user => user.ws === ws);
    if (userIndexConnected !== -1) {
        connectedUsers.splice(userIndexConnected, 1);
    }

    // Handles disconnection from game if user is in one.
    handleDisconnectionFromGame(ws);
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


/**
 * This function is responsible for processing and handling a new move message received from a WebSocket client.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {string} data - The message data in JSON format.
 */
const handleNewMoveMessage = async (ws: WebSocket, data: string) => {
    try {
        // Parse the message data to extract relevant information
        const { roomName, index, username }: NewMove = JSON.parse(data).payload;

        // Find the room to update based on the roomName
        const roomToUpdate = rooms.find(room => room.name === roomName);

        if (roomToUpdate) {
            // Update the game state with the new move
            roomToUpdate.setGameState(index);

            // Get the users in the room
            const roomUsers = roomToUpdate.users;

            // Find the user who made the move
            const currentUser = roomUsers.find(user => user.username === username);
            const otherUser = roomUsers.find(user => user.username !== username);

            // Calculate the winner and check for a draw
            const winner = roomToUpdate.calculateWinner(currentUser!);
            const draw = roomToUpdate.checkDraw();

            // If there's a winner, update scores and log the winner and loser
            if (winner || draw) {

                if (winner) {
                    addScores(currentUser!, otherUser!);
                }

                if (draw) {
                    addDraw(currentUser!, otherUser!);
                }

                const winnerDb = await getUser(currentUser!.username);
                const loserDb = await getUser(otherUser!.username)

                const res = await createMatchHistoryRecord(winnerDb!, loserDb!, draw);
            }

            // Prepare and send a message to each user in the room
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
                };
                user.ws.send(JSON.stringify(message));
            });
        }
    } catch(error) {
        console.error("Error with handle new move:", error);
    }
}


/**
 * Handle a game reset request received from a WebSocket client.
 * This function is responsible for processing and handling a game reset request received from a WebSocket client.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {string} data - The message data in JSON format.
 */
const handleResetGame = (ws: WebSocket, data: string) => {
    // Parse the message data to extract relevant information
    const { username, roomName } = JSON.parse(data).payload;

    // Find the room to update based on the roomName
    const roomToUpdate = rooms.find(room => room.name === roomName);

    if (roomToUpdate) {
        // Attempt to reset the game, which returns true if successful
        const reset = roomToUpdate.resetGame(username);

        // Get the users in the room
        const roomUsers = roomToUpdate.users;

        if (reset) {
            // Send a game reset message to each user in the room
            roomUsers.forEach(user => {
                const message = {
                    type: 'GAME_RESET',
                    message: {
                        starter: roomToUpdate.currentTurn,
                        gameState: roomToUpdate.gameState,
                        lastIndex: roomToUpdate.lastIndex,
                        nextCharacter: roomToUpdate.nextChar,
                    }
                };
                user.ws.send(JSON.stringify(message));

                // Update the connectionStartTime for each user
                user.ws.connectionStartTime = Date.now();
            })
        } else {
            // Notify the other player that a reset request has been received
            const messageReceiver = roomUsers.find(user => user.username !== username);
            if (messageReceiver) {
                const message = {
                    type: 'PLAY_AGAIN',
                    message: {
                        username: username,
                        text: `${username} wants to play again!`
                    }
                };
                messageReceiver.ws.send(JSON.stringify(message));
            }
        }
    }
}


/**
 * This function processes and broadcasts a chat message received from a WebSocket client to all users in the same room.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {string} data - The message data in JSON format.
 */
const handleChatMessage = (ws: WebSocket, data: string) => {
    // Parse the message data to extract relevant information
    const { newMessage, roomName, username } = JSON.parse(data).payload;

    // Find the chat room based on the roomName
    const chatRoom = rooms.find(room => room.name === roomName);

    if (chatRoom) {
        // Get the users in the chat room
        const roomUsers = chatRoom.users;

        // Broadcast the chat message to all users in the room
        roomUsers.forEach(user => {
            const message = {
                type: 'CHAT_MESSAGE',
                message: {
                    message: newMessage,
                    username: username
                }
            };

            // Send the chat message to the user's WebSocket connection
            user.ws.send(JSON.stringify(message));
        });
    }
}


/**
 * This function processes a friend request message received from a WebSocket client.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {string} data - The message data in JSON format.
 */
export const handleFriendRequestMessage = async (ws: WebSocket, data: string) => {
    // Parse the message data to extract relevant information
    const { roomName, username } = JSON.parse(data).payload;

    // Find the room based on the roomName
    const room = rooms.find(room => room.name === roomName);

    if (!room) {
        return; // If the room doesn't exist, exit the function.
    }

    // Find both users.
    const receiverUsername = room.users.find(user => user.username !== username);
    if (!receiverUsername) return;
    const requester = await getUser(username);
    const receiver = await getUser(receiverUsername.username);
    if (!requester || !receiver) return;

    // If friendship already exists return
    const friendshipExists = await friendshipAlreadyExists(requester.id, receiver.id);
    if (friendshipExists) return;

    // Create a friend request message to send to the other user
    const message = {
        type: 'FRIEND_REQUEST',
        message: {
            message: `${username} wants to add you as a friend!`,
            user: username
        }
    };
    receiverUsername.ws.send(JSON.stringify(message));

    // Create a pending friendship between the two users
    createPendingFriendship(requester.id, receiver.id);
}


/**
 * This function processes a disconnection from a game for a WebSocket client.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {string} data - The message data in JSON format.
 */
const handleDisconnectionFromGame = async (ws: WebSocket) => {
    // Find the disconnected user is queuedUsers and remove it.
    const userIndex = queuedUsers.findIndex(user => user.ws === ws);
    if (userIndex !== -1) {
        queuedUsers.splice(userIndex, 1);
    }

    // Find the index of the room where the disconnection occurred
    const roomIndex = rooms.findIndex(room => room.users[0].ws === ws || room.users[1].ws === ws);
    const roomUsers = rooms[roomIndex]?.users;

    if (roomIndex !== -1) {
        // Find the user who disconnected and the other user in the room
        const disconnectedUser = roomUsers.find(user => user.ws === ws);
        const otherUser = roomUsers.find(user => user.ws !== ws);

        // Send a message to the other user indicating that their opponent disconnected
        const opponentDisconnectedMessage = {
            type: 'OPPONENT_DISCONNECTED'
        };
        otherUser?.ws.send(JSON.stringify(opponentDisconnectedMessage));

        // Remove the room from the rooms array
        rooms.splice(roomIndex, 1);

        // If there is another user and the disconnected user and a winner, update scores
        if (otherUser && disconnectedUser) {
            await addScores(otherUser, disconnectedUser);

            const otherUserDb = await getUser(otherUser.username);
            const disconnectedUserDb = await getUser(disconnectedUser.username);
            if (!otherUserDb || !disconnectedUserDb) return;
            await createMatchHistoryRecord(otherUserDb, disconnectedUserDb, false);
        }
    }
};


/**
 * This function processes an acceptance of a friend request received from a WebSocket client.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {string} data - The message data in JSON format.
 */
const handleAcceptFriendRequest = async (ws: WebSocket, data: string) => {
    // Parse the message data to extract the usernames of the user and friend
    const { username, friendUsername } = JSON.parse(data).payload;

    // Ensure both usernames are provided
    if (!username || !friendUsername) {
        return;
    }

    // Retrieve user and friend data from the database
    const user = await getUser(username);
    const friend = await getUser(friendUsername);

    // If either user or friend data is missing, exit the function
    if (!user || !friend) {
        return;
    }

    // Accept the pending friendship between the two users
    acceptPendingFriendship(user.id, friend.id);
}
