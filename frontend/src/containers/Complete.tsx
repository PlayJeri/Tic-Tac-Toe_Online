import React, { useRef, useState } from "react";
import GameBoard from "../components/GameBoard";
import jwtDecode from "jwt-decode";
import { DecodedAccessToken } from "../utils/types";
import { ChatBox } from "../components/ChatBox";
import '../styles/Complete.css';


export const Complete: React.FC = () => {
    const [username, setUsername] = useState('');
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [yourTurn, setYourTurn] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [searching, setSearching] = useState(false);

    const [gameState, setGameState] = useState<string[][]>([])
    const [winner, setWinner] = useState<string | null>(null);

    const [messages, setMessages] = useState<{ text: string; username: string }[]>([]);

    const wsServiceRef = useRef<WebSocket | null>(null);
    const accessToken = localStorage.getItem("access_token");

    const handleConnect = () => {
        if (connected) {
            return;
        }
        if (!accessToken) return;
        const decodedToken: DecodedAccessToken = jwtDecode(accessToken);
        setSearching(true);
        
        // wsServiceRef.current = new WebSocket('ws://80.220.88.45:80');
        wsServiceRef.current = new WebSocket(`ws://localhost:3000?token=${accessToken}`);

        wsServiceRef.current.onopen = () => {
            console.log("Connected to WebSocket server");
            console.log(`Username is ${decodedToken.username}`)
            wsServiceRef.current?.send(JSON.stringify({
                type: 'NEW_USER',
                payload: {
                    username: decodedToken.username,
                    accessToken: accessToken,
                } }));
            }
        setUsername(decodedToken.username);

        wsServiceRef.current.onmessage = (event) => {
            const { type, message } = JSON.parse(event.data);
            console.log(type, "|", message)
            if (type == 'START_GAME') {
                console.log("game started");
                setSearching(false);
                setRoomName(message.roomName);
                if (message.starter === decodedToken.username) {
                    setYourTurn(true);
                }
                setGameState(message.gameState);
                setGameStarted(true);
            }
            if (type === 'GAME_UPDATED') {
                console.log('game update message');
                if (message.winner) {
                    setWinner(message.winner);
                    setYourTurn(false);
                } else if (message.playerTurn === decodedToken.username) {
                    setYourTurn(true);
                }
                setGameState(message.gameState);
                if (message.draw) {
                    setWinner('draw')
                    setYourTurn(false)
                }
            }
            if (type === 'GAME_RESET') {
                console.log('Game reset');
                setWinner(null);
                setGameState(message.gameState);
                setGameStarted(true);
                if (message.starter === decodedToken.username) {
                    setYourTurn(true);
                }
            }
            if (type === 'CHAT_MESSAGE') {
                setMessages(prevMessages => [...prevMessages, { text: message.message, username: message.username }]);
            }
        }
    
        wsServiceRef.current.onclose = () => {
            console.log("Disconnected from WebSocket server");
            setGameStarted(false)
            setConnected(false);
        }
        
    }
    
    const handleClick = (index: number): void => {
        if (!yourTurn) {
            return;
        }
        wsServiceRef.current?.send(JSON.stringify({ 
            type: "NEW_MOVE",
            payload: {
                roomName: roomName,
                index: index,
                username: username
            } 
        }));

        setYourTurn(!yourTurn)
    }

    const handleResetGame = (): void => {
        wsServiceRef.current?.send(JSON.stringify({
            type: "RESET_GAME",
            payload: {
                username: username,
                roomName: roomName
            }
        }))
    }

    return (
        <>
        <div className="lobby">
            <h1>Welcome to play tic-tac-toe</h1>
            <h2>{winner ? `${winner}` : null}{winner && winner !== 'draw' ? " wins!" : ""}</h2>
            <h2>{yourTurn ? "Your turn" : "Wait for your turn"}</h2>
            {!gameStarted && (
                <>
                <button onClick={handleConnect} disabled={connected}>
                    { searching
                        ? <div className="search-container">
                            <p>Searching...</p>
                            <div className="spinner"></div>
                        </div>
                         
                        : <p>Find a match</p>
                    }
                </button>
                </>
            )}
        </div>
        { gameStarted ? 
            <div className="game">
                { winner 
                    ? <button onClick={handleResetGame}>Play again</button> 
                    : null
                }
                <div className="game-board">
                    <GameBoard squares={gameState} onClick={handleClick} />
                </div>
            </div> 
        : null}
        <ChatBox
            wsService={wsServiceRef}
            username={username}
            roomName={roomName}
            messages={messages}
        />
        </>
    )
}
