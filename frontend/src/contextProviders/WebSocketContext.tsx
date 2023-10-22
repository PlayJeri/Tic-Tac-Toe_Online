import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { checkAuthStatus } from "../helpers/apiCommunicator";

interface WebSocketContextType {
    webSocket: WebSocket | null;
    setWebSocket: (ws: WebSocket | null) => void;
    sendNewUserMessage: (username: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context
}

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

    const sendNewUserMessage = (username: string) => {
        if (webSocket) {
            console.log('send new user message');
            const message = {
                type: 'NEW_USER',
                payload: {
                    username: username
                }
            }
            webSocket.send(JSON.stringify(message));
        }
    };

    useEffect(() => {
        async function checkStatus() {
            const data = await checkAuthStatus();
            if (!data) return
            const wsConn = new WebSocket(`ws://localhost:3000`);
            setWebSocket(wsConn);
            sendNewUserMessage(data.username);          
        }
        checkStatus();
    }, []);

    // Include the sendNewUserMessage function in the context value
    const contextValue = {
        webSocket,
        setWebSocket,
        sendNewUserMessage,
    };   

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    )
}