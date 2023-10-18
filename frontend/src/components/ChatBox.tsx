import React, { useState } from 'react';
import { ChatProps } from '../utils/types';
import "../styles/ChatBox.css";

export const ChatBox: React.FC<ChatProps> = ({ messages, username, roomName, wsService }) => {

    const [newMessage, setNewMessage] = useState('');

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
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
        <div className='chat-box col-5'>
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