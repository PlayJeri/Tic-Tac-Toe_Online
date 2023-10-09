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


    return (
        <nav className="navbar navbar-expand-lg bg-dark-subtle">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">Navbar</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profile</Link>
                </li>
              </ul>
            </div>
          </div>
          {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={handleModalClose} />}
        </nav>
      );      
}

