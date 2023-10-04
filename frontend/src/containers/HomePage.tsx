import { NavBar } from "../components/NavBar";
import TicTacToeImage from "../../src/assets/ttt-bg.png";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";


const TicTacToeBoard: React.FC = () => {
    return (
        <div className="ttt-board-container">
            <img src={TicTacToeImage} alt="Tic Tac Toe Board" className="ttt-image" />
            <Link to="/game" className="play-button">PLAY</Link>
        </div>
    )
}

export const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <NavBar />
            <TicTacToeBoard />
        </div>
    )
}