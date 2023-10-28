import { Badge, ListGroup } from 'react-bootstrap';
import { ProfileInfo } from '../utils/types';


export const ProfileInfoListComponent: React.FC<ProfileInfo> = ({ wins, losses, draws, secondsPlayed }) => {

    const formatGameTime = (timePlayedSeconds: number): string =>  {
        const hours = Math.floor(timePlayedSeconds / 3600);
        const minutes = Math.floor((timePlayedSeconds % 3600) / 60);
        const seconds = timePlayedSeconds % 60;
  
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

    return (
      <>
      <ListGroup as='ul'>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Wins
          </div>
          <Badge bg='primary' pill>
            {wins}
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Losses
          </div>
          <Badge bg='primary' pill>
            {losses}
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Draws
          </div>
          <Badge bg='primary' pill>
            {draws}
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Win Loss Ratio
          </div>
          <Badge bg='primary' pill>
            {(wins / losses).toFixed(2)}
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Win %
          </div>
          <Badge bg='primary' pill>
            {((wins / (wins + losses + draws)) * 100).toFixed(1)}%
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Loss %
          </div>
          <Badge bg='primary' pill>
            {((losses / (wins + losses + draws)) * 100).toFixed(1)}%
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Draw %
          </div>
          <Badge bg='primary' pill>
            {((draws / (wins + losses + draws)) * 100).toFixed(1)}%
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item as='li' className='d-flex justify-content-between align-items-center py-3'>
          <div className="fw-bold">
            Time Played
          </div>
          <Badge bg='primary' pill>
            {formatGameTime(secondsPlayed)}
          </Badge>
        </ListGroup.Item>
      </ListGroup>
      </>
    )
}