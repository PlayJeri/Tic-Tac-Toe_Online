export interface StartGameMessage {
    type: string;
    message: {
        room_name: string;
        starter: string;
    }
}

export interface DecodedAccessToken {
    userId: number;
    username: string;
    iat: number;
    exp: number;
}

export interface ProfileInfo {
    username: string;
    wins: number;
    losses: number;
    secondsPlayed: number;
}

export interface ChatProps {
    wsService: React.MutableRefObject<WebSocket | null>;
    username: string;
    roomName: string;
    messages: { text: string; username: string; }[];
}