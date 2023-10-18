import React, { useRef, useState, useEffect } from "react";
import GameBoard from "../components/GameBoard";
import jwtDecode from "jwt-decode";
import { DecodedAccessToken } from "../utils/types";
import { NavBar } from "../components/NavBar";
import { ChatBox } from "../components/ChatBox";
import '../styles/Complete.css';
import { Button } from "react-bootstrap";


export const Complete: React.FC = () => {
    const [username, setUsername] = useState('');
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [yourTurn, setYourTurn] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [searching, setSearching] = useState(false);
    const [playAgain, setPlayAgain] = useState("");
    const [message, setMessage] = useState("");

    const [gameState, setGameState] = useState<string[][]>([])
    const [winner, setWinner] = useState<string | null>(null);

    const [messages, setMessages] = useState<{ text: string; username: string }[]>([]);

    const wsServiceRef = useRef<WebSocket | null>(null);
    const accessToken = localStorage.getItem("access_token");

    useEffect(() => {
        handleConnect();
    }, [])

    const handleConnect = () => {
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
                if (message.draw) {
                    setWinner('draw')
                    setYourTurn(false)
                }
                if (message.winner) {
                    setWinner(message.winner);
                    setYourTurn(false);
                } else if (message.playerTurn === decodedToken.username) {
                    setYourTurn(true);
                }
                setGameState(message.gameState);
            }
            if (type === 'GAME_RESET') {
                console.log('Game reset');
                setWinner(null);
                setGameState(message.gameState);
                setGameStarted(true);
                if (message.starter === decodedToken.username) {
                    setYourTurn(true);
                }
                setPlayAgain("");
            }
            if (type === 'CHAT_MESSAGE') {
                setMessages(prevMessages => [...prevMessages, { text: message.message, username: message.username }]);
            }
            if (type === 'PLAY_AGAIN') {
                console.log(message);
                setPlayAgain(message.text);
            }
            if (type === 'OPPONENT_DISCONNECTED') {
                setWinner(username);
                setYourTurn(false);
                setMessage("Opponent disconnected.")
            }
        }
    
        wsServiceRef.current.onclose = () => {
            console.log("Disconnected from WebSocket server");
            setGameStarted(false)
            setConnected(false);
        }
        
    }

    useEffect(() => {

        const cleanup = () => {
            const ws = wsServiceRef.current;
            console.log(ws, ws?.readyState);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }

        window.addEventListener('unload', cleanup);

        return () => {
            window.removeEventListener('unload', cleanup);
            cleanup();
        }
    }, [])
    
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
        <NavBar />
        { !gameStarted && searching ?
        <div className="row justify-content-center text-center mt-5">
            <div className="col-6 pt-5">
                <Button variant="outline-primary" className="mt-5">
                <h2>Searching...</h2>
                <div className="spinner"></div>
                </Button>
            </div>
        </div>
        : null
        }
        { gameStarted ? 
            <div className="container">
                <div className="row mt-4 justify-content-center text-center">
                    <h1>{roomName.replace("+", " vs ")}</h1>
                </div>
                <div className="row my-5 text-center justify-content-center">
                        <div className="col-6">
                            <h2>
                            {winner ? `${winner}` : null}
                            {winner && winner !== 'draw' ? " wins! " : ""}
                            </h2>
                        </div>
                    </div>
                <div className="row text-center justify-content-center">
                    <div className="col-6">
                        {winner ? <Button className="me-4" variant="primary" onClick={handleResetGame}>Play again</Button> : null}
                    </div>
                </div>
                <div className="row text-center justify-content-center">
                    <div className="col-6">
                        <h5 className="mt-2">
                        {playAgain ? playAgain : null}
                        </h5>
                    </div>
                </div>
                <div className="row text-center pt-5">
                    <div className="col-5">
                    {winner
                        ? null
                        :<h2>{yourTurn ? "Your turn" : "Wait for your turn"}</h2> 
                    }
                        <GameBoard squares={gameState} onClick={handleClick} />
                    </div>
                <ChatBox 
                    wsService={wsServiceRef}
                    username={username}
                    roomName={roomName}
                    messages={messages}
                    />
                </div>
            </div>
        : null}
        </>
    )
}
