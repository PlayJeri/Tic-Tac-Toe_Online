import { WebSocket } from "ws";

export interface User {
    ws:        WebSocket;
    username:  string;
}

export interface NewMove {
    roomName:  string;
    index:     string;
    character: string;
    username:  string;
}

export interface LoginRequestBody {
    username: string;
    password: string;
}

export interface RegisterRequestBody {
    username:  string;
    password:  string;
    password2: string;
}

export interface userData {
    username: string;
}

export interface DecodedAccessToken {
    userId: number;
    username: string;
    iat: number;
    exp: number;
}