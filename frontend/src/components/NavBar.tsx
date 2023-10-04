import React, { useState, useEffect } from "react";
import { LoginModal } from "./LoginModal";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"


export const NavBar: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleLoginClick = () => {
        setShowLoginModal(true);
    }

    const handleModalClose = () => {
        setShowLoginModal(false);
    }

    useEffect(() => {
        const checkIfLoggedIn = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return setShowLoginModal(true);

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': "application/json",
            };

            const response = await fetch('http://localhost:3000/auth/validate', {
                 method: 'POST',
                 headers: headers,
            })

            if (response.status !== 200) {
                setShowLoginModal(true);
            }
        }

        checkIfLoggedIn();
    }, [])


    return(
        <nav>
            <div className="nav-container">
                <div className="logo">Logo here</div>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                </ul>
                <div className="login-link">
                    <button onClick={handleLoginClick}>Login</button>
                </div>
            </div>
            {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={handleModalClose} />}
        </nav>
    )
}

