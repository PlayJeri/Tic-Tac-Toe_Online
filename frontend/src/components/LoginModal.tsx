import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { AlertComponent } from "./Alert";

import { useWebSocketContext } from "../contextProviders/WebSocketContext";
import { useAuthContext } from "../contextProviders/AuthenticationContextProvider";

interface LoginModalProps {
    showCustomAlert: (message: string, variant: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ showCustomAlert}) => {
    const [showModal, setShowModal] = useState(false);
    const [showLoginFailedAlert, setShowLoginFailedAlert] = useState(false);
    const wsContext = useWebSocketContext();
    const authContext = useAuthContext();

    const handleModalClose = () => setShowModal(false);
    const handleModalOpen = () => setShowModal(true);

    useEffect(() => {
        if (authContext?.user) {
            setShowModal(false);
        }
    }, [])


    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;
            console.log(username, password);
            await authContext?.login(username, password); 

            showCustomAlert("Login successful!", "success");
            setShowModal(false);

            const wsConn = new WebSocket(`ws://localhost:3000`);
            wsContext.setWebSocket(wsConn);
            wsContext.sendNewUserMessage(username);
        } catch (error) {
            console.error("Error occurred during login: ", error);
            setShowLoginFailedAlert(true);
        }
    }

    return (
        <>
            {authContext?.isLoggedIn
            ?
                <Button variant="outline-danger" onClick={authContext?.logout}>
                    Logout
                </Button>
            :
                <Button variant="outline-success" onClick={handleModalOpen}>
                    Login
                </Button>
            }

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