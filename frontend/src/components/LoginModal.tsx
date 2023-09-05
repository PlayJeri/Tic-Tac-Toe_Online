import React, { useState } from "react";
import { Link } from "react-router-dom";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value });
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login form data: ", formData);
        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("access_token", data.token);
                onClose();
            } else {
                console.error("Authentication failed");
            }
        } catch (error) {
            console.error("Error occurred during login: ", error);
        }
    }

    return (
        <div className={`login-modal ${isOpen ? 'open' : ''}`}>
            <h2>Login</h2>
            <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have ac account? <Link to="/register">Register here</Link>
            </p>
            <button onClick={onClose}>Close</button>
        </div>
    )
}