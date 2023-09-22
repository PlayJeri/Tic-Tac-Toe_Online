import React, { useState } from 'react';
import { ChatProps } from '../utils/types';

export const ChatBox: React.FC<ChatProps> = ({ messages, username, roomName, wsService }) => {

    const [newMessage, setNewMessage] = useState('');

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (newMessage) {
            wsService.current?.send(
                JSON.stringify({
                    type: "CHAT_MESSAGE",
                    payload: {
                        newMessage,
                        roomName,
                        username
                    }
                })
            )
            setNewMessage('');
        }
    };

    return (
        <div>
            <div className='chat-messages'>
                {messages.map((message, index) => (
                    <div key={index}>
                        <strong>{message.username}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <div className='chat-input'>
                <input type='text' value={newMessage} onChange={handleMessageChange} />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    )
}