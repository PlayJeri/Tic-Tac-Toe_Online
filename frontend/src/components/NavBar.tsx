import React, { useState } from "react";
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


    return(
        <nav>
            <div className="nav-container">
                <div className="logo">Logo here</div>
                <ul className="nav-links">
                    <li><Link to="/home">Home</Link></li>
                    <li>Profile</li>
                </ul>
                <div className="login-link">
                    <button onClick={handleLoginClick}>Login</button>
                </div>
            </div>
            {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={handleModalClose} />}
        </nav>
    )
}

