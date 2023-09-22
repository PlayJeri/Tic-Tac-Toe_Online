import '../styles/GameBoard.css';

interface GameBoardProps {
    squares: any[];
    onClick: (index: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ squares, onClick }) => {
    let board = squares;


    const renderSquare = (index: number): JSX.Element => {
        return (
            <button className='square' onClick={() => onClick(index)} disabled={board[index] !== null}>
                {board[index]}
            </button>
        )
    }

    return (
        <div className='game-board'>
            <div className='board-row'>
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className='board-row'>
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className='board-row'>
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    )
}

export default GameBoard;