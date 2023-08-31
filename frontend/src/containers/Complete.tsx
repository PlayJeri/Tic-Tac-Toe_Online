import React, { useRef, useState } from "react";
import GameBoard from "../components/GameBoard";


const Complete: React.FC = () => {
    const [username, setUsername] = useState('');
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [yourTurn, setYourTurn] = useState(false);
    const [roomName, setRoomName] = useState("");

    const [gameState, setGameState] = useState<string[][]>([])
    const [winner, setWinner] = useState<string | null>(null);

    const wsServiceRef = useRef<WebSocket | null>(null);
    
    const handleConnect = () => {
        if (connected) {
            return;
        }
        // wsServiceRef.current = new WebSocket('ws://80.220.88.45:80');
        wsServiceRef.current = new WebSocket('ws://localhost:3000');
        wsServiceRef.current.onopen = () => {
            console.log("Connecter to WebSocket server");
            wsServiceRef.current?.send(JSON.stringify({ type: 'NEW_USER', username }));
        }

        wsServiceRef.current.onmessage = (event) => {
            const { type, message } = JSON.parse(event.data);
            if (type == 'START_GAME') {
                setRoomName(message.roomName);
                if (message.starter === username) {
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
                } else if (message.playerTurn === username) {
                    setYourTurn(true);
                }
                setGameState(message.gameState);
            }
            if (type === 'GAME_RESET') {
                console.log('Game reset');
                setWinner(null);
                setGameState(message.gameState);
                setGameStarted(true);
                if (message.starter === username) {
                    setYourTurn(true);
                }
            }
        }
    
        wsServiceRef.current.onclose = () => {
            console.log("Disconnected from WebSocket server");
            setGameStarted(false)
            setConnected(false);
        }
        
    }
    
    const handleClick = (index: number): void => {
        console.log('handle click');
        if (!yourTurn) {
            return;
        }
        
        wsServiceRef.current?.send(JSON.stringify({ 
            type: "NEW_MOVE",
            message: {
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
            message: {
                username: username,
                roomName: roomName
            }
        }))
    }


    return (
        <>
        <div className="lobby">
            <h1>Welcome to play tic-tac-toe</h1>
            <h2>{winner ? `${winner} wins!` : null}</h2>
            <h2>{yourTurn ? "Your turn" : "Wait for your turn"}</h2>
            {!gameStarted && (
                <>
                <input
                    type='text'
                    placeholder='Enter your username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                <button onClick={handleConnect} disabled={connected}>
                    {connected ? 'Connected' : 'Connect'}
                </button>
            </>
        )}
        </div>
        {gameStarted ?         <div className="game">
            { winner ? <button onClick={handleResetGame}>Play again</button> : null}
            <div className="game-board">
                <GameBoard squares={gameState} onClick={handleClick} />
            </div>
        </div> : null}
        </>
    )
}

export default Complete;