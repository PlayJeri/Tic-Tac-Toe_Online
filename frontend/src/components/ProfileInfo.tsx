import { ProfileInfo } from '../utils/types';


export const ProfileInfoListComponent: React.FC<ProfileInfo> = ({ wins, losses, secondsPlayed }) => {

    const formatGameTime = (timePlayedSeconds: number): string =>  {
        const hours = Math.floor(timePlayedSeconds / 3600);
        const minutes = Math.floor((timePlayedSeconds % 3600) / 60);
        const seconds = timePlayedSeconds % 60;
  
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

    return (
        <div className="col-6 mx-auto">
        <ul className="list-group border-success">
        <li className="list-group-item border-secondary d-flex justify-content-between align-items-center">
          Wins
          <span className="badge bg-primary rounded-pill">{wins}</span>
        </li>
        <li className="list-group-item border-secondary d-flex justify-content-between align-items-center">
          Losses
          <span className="badge bg-primary rounded-pill">{losses}</span>
        </li>
        <li className="list-group-item border-secondary d-flex justify-content-between align-items-center">
          Time Played
          <span className="badge bg-primary rounded-pill">{formatGameTime(secondsPlayed)}</span>
        </li>
      </ul>
        </div>
    )
}