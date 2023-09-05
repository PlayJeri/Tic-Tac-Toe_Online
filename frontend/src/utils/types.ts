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