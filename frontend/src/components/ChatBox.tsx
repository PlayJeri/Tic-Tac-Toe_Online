import React, { useState } from 'react';
import { ChatProps } from '../utils/types';
import { useWebSocketContext } from "../utils/WebSocketContext";
import "../styles/ChatBox.css";

export const ChatBox: React.FC<ChatProps> = ({ messages, username, roomName }) => {
    const { webSocket } = useWebSocketContext();
    const [newMessage, setNewMessage] = useState('');

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            webSocket?.send(
                JSON.stringify({
                    type: "CHAT_MESSAGE",
                    payload: {
                        newMessage,
                        roomName,
                        username
                    }
                })
            )
            setNewMessage('')
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    }

    return (
        <div className='chat-box col-5' style={{ height: '400px', overflowY: 'auto' }}>
            <div className='chat-messages'>
                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${
                        message.username === username ? 'right' : 'left'
                    }`}>
                        <strong>{message.username}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <div className='chat-input'>
                <input 
                    type='text'
                    value={newMessage}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    )
}