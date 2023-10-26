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

export interface tokenPayload {
    username: string;
    userId: number;
}

export interface DecodedAccessToken {
    userId: number;
    username: string;
    iat: number;
    exp: number;
}

export interface UserDatabase {
    id: number;
    username: string;
    password: string;
    wins: number;
    losses: number;
    timePlayedSeconds: number;
}