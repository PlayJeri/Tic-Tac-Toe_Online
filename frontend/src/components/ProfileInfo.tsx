import { Badge, ListGroup } from 'react-bootstrap';
import { ProfileInfo } from '../utils/types';


export const ProfileInfoListComponent: React.FC<ProfileInfo> = ({ wins, losses, secondsPlayed }) => {

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
            Win ratio
          </div>
          <Badge bg='primary' pill>
            {(wins / losses).toFixed(2)}
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