import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GameBoard from "../components/GameBoard";
import jwtDecode from "jwt-decode";
import { DecodedAccessToken } from "../utils/types";
import { NavBar } from "../components/NavBar";
import { ChatBox } from "../components/ChatBox";
import '../styles/Complete.css';
import { Container, Button, Col, Row, Toast } from "react-bootstrap";
import { useWebSocketContext } from "../utils/WebSocketContext";

export const Complete: React.FC = () => {
    const [username, setUsername] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [yourTurn, setYourTurn] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [searching, setSearching] = useState(false);
    const [playAgain, setPlayAgain] = useState("");
    const [gameState, setGameState] = useState<string[][]>([])
    const [toast, setToast] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ text: string; username: string }[]>([]);
    
    const { webSocket } = useWebSocketContext();
    const accessToken = localStorage.getItem("access_token");
    const location = useLocation();

    const toggleShowToast = () => setShowToast(!showToast);

    useEffect(() => {
        handleConnect();

        const handleDisconnect = () => {
            webSocket?.send(JSON.stringify({
                type: "OPPONENT_DISCONNECTED"
            }))
        }

        return () => {
            console.log('remove listener')
            handleDisconnect();
        };

    }, [, location])

    const handleConnect = () => {
        if (!accessToken) return;
        const decodedToken: DecodedAccessToken = jwtDecode(accessToken);
        setSearching(true);
        const ws = webSocket;
        if (!ws) return;

        console.log(decodedToken.username, "connected to WebSocket server");
        ws.send(JSON.stringify({
            type: 'QUEUE_USER',
            payload: {
                username: decodedToken.username,
                accessToken: accessToken,
            } }));
        setUsername(decodedToken.username);

        ws.onmessage = (event) => {
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
                setWinner(`Opponent disconnected! ${username}`);
                setYourTurn(false);
            }
            if (type === 'FRIEND_REQUEST') {
                showFriendReqToast(message.message);
            }
        }
    
        ws.onclose = () => {
            console.log("Disconnected from WebSocket server");
            setGameStarted(false)
        }
        
    }

    const showFriendReqToast = (message: string) => {
        console.log("message is", message);
        setToast(message);
        toggleShowToast();
    }
    
    const handleClick = (index: number): void => {
        if (!yourTurn) {
            return;
        }
        webSocket?.send(JSON.stringify({ 
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
        webSocket?.send(JSON.stringify({
            type: "RESET_GAME",
            payload: {
                username: username,
                roomName: roomName
            }
        }))
    }

    const addFriend = () => {
        webSocket?.send(JSON.stringify({
            type: "FRIEND_REQUEST",
            payload: {
                username: username,
                roomName: roomName
            }
        }))
    }

    const acceptFriend = () => {
        const friendUsername = roomName.split("+").find(name => name !== username);
        webSocket?.send(JSON.stringify({
            type: "REQUEST_ACCEPTED",
            payload: {
                username: username,
                friendUsername: friendUsername
            }
        }))
    }

    return (
        <>
        <NavBar />
        <Toast show={showToast} onClose={toggleShowToast} >
            <Toast.Header>
                <strong className="me-auto">Friend request!</strong>
            </Toast.Header>
            <Toast.Body>
                {toast}
                <Button onClick={acceptFriend}>Accept</Button>
            </Toast.Body>
        </Toast>
        { !gameStarted && searching ?
        <Row className="justify-content-center text-center mt-5">
            <Col className="col-6 pt-5">
                <Button variant="outline-primary" className="mt-5">
                    <h2>Searching...</h2>
                    <div className="spinner"></div>
                </Button>
            </Col>
        </Row>
        : null
        }
        { gameStarted ? 
            <Container>
                <Row className="mt-4 justify-content-center text-center">
                    <h1>{roomName.replace("+", " vs ")}</h1>
                </Row>
                <Row className="my-5 text-center justify-content-center">
                    <Col xs={6}>
                        <h2>
                            {winner ? `${winner}` : null}
                            {winner && winner !== 'draw' ? " wins! " : ""}
                        </h2>
                    </Col>
                    </Row>
                <Row className="text-center justify-content-center">
                    <Col xs={6} >
                        {winner ? <Button className="me-4" variant="primary" onClick={handleResetGame}>Play again</Button> : null}
                    </Col>
                </Row>
                <div className="row text-center justify-content-center">
                    <Col xs={4}>
                        <h5 className="mt-2">
                        {playAgain ? playAgain : null}
                        </h5>
                    </Col>
                </div>
                <div className="row text-center pt-5">
                    <Col>
                    {winner
                        ? null
                        :<h2>{yourTurn ? "Your turn" : "Wait for your turn"}</h2> 
                    }
                        <GameBoard squares={gameState} onClick={handleClick} />
                    </Col>
                <ChatBox
                    username={username}
                    roomName={roomName}
                    messages={messages}
                    />
                </div>
                <Row>
                    <Col className="text-center py-5">
                        <Button onClick={addFriend}>
                            Add {roomName.split("+").find(name => name !== username)} as friend
                        </Button>
                    </Col>
                </Row>
            </Container>
        : null}
        </>
    )
}
