import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "./AuthenticationContextProvider";

// Define the interface for the WebSocket context
interface WebSocketContextType {
    webSocket: WebSocket | null; // The WebSocket connection instance
    setWebSocket: (ws: WebSocket | null) => void; // A function to set the WebSocket instance
    sendNewUserMessage: (username: string) => void; // A function to send a new user message over WebSocket
}

// Create a WebSocket context with an initial value of 'undefined'
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Custom hook to access the WebSocket context
export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
}

// WebSocketProvider component that wraps the entire application
export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    // State to manage the WebSocket connection
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const authContext = useAuthContext();

    // Function to send a new user message over WebSocket
    const sendNewUserMessage = (username: string) => {
        if (webSocket) {
            const message = {
                type: 'NEW_USER',
                payload: {
                    username: username
                }
            }
            webSocket.send(JSON.stringify(message));
        }
    };

    // UseEffect to initialize WebSocket and send a message when the component mounts
    useEffect(() => {
        // Function to check the user's authentication status
        async function checkStatus() {
            if (!authContext?.isLoggedIn || !authContext.user?.username) return;
            // Establish a WebSocket connection to the specified URL
            const wsConn = new WebSocket(`ws://localhost:3000`);
            setWebSocket(wsConn); // Set the WebSocket instance in the state
            sendNewUserMessage(authContext.user?.username); // Send a new user message with the authenticated username
        }
        checkStatus(); // Execute the checkStatus function when the component mounts
    }, [authContext?.isLoggedIn]);

    // Create the context value to provide to the context consumers
    const contextValue = {
        webSocket,
        setWebSocket,
        sendNewUserMessage,
    };

    // Return the WebSocketProvider with the context value wrapping the children
    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    )
}
