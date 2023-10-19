import { NavBar } from "../components/NavBar";
import TicTacToeImage from "../../src/assets/ttt-bg.png";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";


export const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <NavBar />
            <div className="ttt-board-container">
                <img src={TicTacToeImage} alt="Tic Tac Toe Board" className="ttt-image" />
                <Link to="/game" className="play-button">PLAY</Link>
            </div>
        </div>
    )
}