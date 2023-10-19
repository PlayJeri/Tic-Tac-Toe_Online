import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { AlertComponent } from "./Alert";

import { useWebSocketContext } from "../utils/WebSocketContext";
import jwtDecode from "jwt-decode";
import { DecodedAccessToken } from "../utils/types";

interface LoginModalProps {
    showCustomAlert: (message: string, variant: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ showCustomAlert}) => {
    const [showModal, setShowModal] = useState(false);
    const [showLoginFailedAlert, setShowLoginFailedAlert] = useState(false);
    const { webSocket, setWebSocket } = useWebSocketContext();
    const accessToken = localStorage.getItem('access_token');

    const decodedToken: DecodedAccessToken | null = accessToken ? jwtDecode(accessToken) : null;


    const handleModalClose = () => setShowModal(false);
    const handleModalOpen = () => setShowModal(true);

    useEffect(() => {
        const checkIfLoggedIn = async () => {
            if (!accessToken) return setShowModal(true);

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': "application/json",
            };

            const response = await fetch('http://localhost:3000/auth/validate', {
                 method: 'POST',
                 headers: headers,
            })

            if (response.status !== 200) {
                setShowModal(true);
                return
            }

            if (webSocket === null) {
                const wsConn = new WebSocket(`ws://localhost:3000?token=${accessToken}`);
                setWebSocket(wsConn);
            }
        }

        checkIfLoggedIn();

        if (!decodedToken) return;
        if (!webSocket) return;
        sendNewUserMessage(webSocket, decodedToken.username);
    }, [])

    const handleFormSubmit = async (formData: any) => {
        try {
            console.log('login try');
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
            
            if (response.ok) {
                const data = await response.json();
                showCustomAlert("Login successful!", "success");
                localStorage.setItem("access_token", data.token);
                setShowModal(false);

                const wsConn = new WebSocket(`ws://localhost:3000?token=${data.token}`);
                setWebSocket(wsConn);

            } else {
                setShowLoginFailedAlert(true);
                console.error("Authentication failed");
            }
        } catch (error) {
            console.error("Error occurred during login: ", error);
        }
    }

    function sendNewUserMessage(ws: WebSocket, username: string) {
        console.log('send new user message');
        const message = {
            type: 'NEW_USER',
            payload: {
                username: username
            }
        }
        ws.send(JSON.stringify(message));
    }

    return (
        <>
            <Button variant="outline-success" onClick={handleModalOpen}>
                Login
            </Button>

            <Modal
                show={showModal}
                onHide={handleModalClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Log in</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                {showLoginFailedAlert && <AlertComponent variant={"danger"} message={"Invalid credentials"} />}

                <LoginForm handleFormSubmit={handleFormSubmit}/>

                <div className="text-center">
                <p>Don't have an account?</p>
                    <Link to="/register">
                        <Button variant="outline-success">
                                Register here
                        </Button>
                    </Link>
                </div>
                
                </Modal.Body>
            </Modal>
        </>
    )
}