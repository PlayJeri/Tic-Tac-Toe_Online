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
    draws: number;
    secondsPlayed: number;
}

export interface ChatProps {
    username: string;
    roomName: string;
    messages: { text: string; username: string; }[];
}

export interface MatchHistoryData {
    winnerUsername: string;
    loserUsername: string;
    draw?: boolean;
    matchTime: Date;
}