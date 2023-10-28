import { Link } from "react-router-dom";
import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { AlertComponent } from "./Alert";


export const NavBar: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showCustomAlert = (message: string, variant: string) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setShowAlert(true);
  }

  return (
    <>
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
          <LoginModal showCustomAlert={showCustomAlert}/>
      </nav>
      {showAlert ?
      <AlertComponent 
        variant={alertVariant}
        message={alertMessage}
      />
      : null}
    </>
    );      
}

