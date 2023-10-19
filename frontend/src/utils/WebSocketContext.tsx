import { ReactNode, createContext, useContext, useState } from "react";


interface WebSocketContextType {
    webSocket: WebSocket | null;
    setWebSocket: (ws: WebSocket | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocketContext() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

    return (
        <WebSocketContext.Provider value={{ webSocket, setWebSocket }}>
            {children}
        </WebSocketContext.Provider>
    )
}