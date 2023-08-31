export interface StartGameMessage {
    type: string;
    message: {
        room_name: string;
        starter: string;
    }
}
