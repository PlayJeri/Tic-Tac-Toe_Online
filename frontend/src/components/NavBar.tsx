import { Link } from "react-router-dom";
import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { AlertComponent } from "./Alert";
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import logo from "../assets/ttt-bg.png";


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
    <Navbar expand="md" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand>
            <img 
              src={logo} 
              style={{ maxWidth: '150px', maxHeight: '40px' }}
            />
            Tic-Tac-Toe
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={"/"}>Home</Nav.Link>
            <Nav.Link as={Link} to={"/profile"}>Profile</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Nav.Item>
              <LoginModal showCustomAlert={showCustomAlert}/>
            </Nav.Item>
          </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showAlert ?
      <AlertComponent 
        variant={alertVariant}
        message={alertMessage}
      />
      : null}
    </>
    );      
}

