import React from 'react';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import { MatchHistoryData } from '../utils/types';
import { Dropdown } from 'react-bootstrap';
import { sendFriendRequest } from '../helpers/apiCommunicator';

interface MatchHistoryProps {
  matchHistory: MatchHistoryData[];
  username?: string;
}

const formatMatchTimeAgo = (matchTime: Date) => {
    const currentTime = new Date();
    const matchDate = new Date(matchTime);
  
    const timeDifferenceInSeconds = Math.floor((currentTime.getTime() - matchDate.getTime()) / 1000);
  
    if (timeDifferenceInSeconds < 60) {
      return `${timeDifferenceInSeconds} second${timeDifferenceInSeconds === 1 ? '' : 's'} ago`;
    } else if (timeDifferenceInSeconds < 3600) {
      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      return `${minutes} m ago`;
    } else if (timeDifferenceInSeconds < 86400) {
      const hours = Math.floor(timeDifferenceInSeconds / 3600);
      return `${hours} h ago`;
    } else {
      const days = Math.floor(timeDifferenceInSeconds / 86400);
      return `${days} d ago`;
    }
  };

const MatchHistoryList: React.FC<MatchHistoryProps> = ({ matchHistory, username }) => {

  const handleSendFriendRequest = (username: string) => {
    sendFriendRequest(username);
  };

  return (
    <div style={{ maxHeight: '458px', overflowY: 'auto' }}>
    <ListGroup variant="">
      {matchHistory.map((match, index) => (
        <ListGroup.Item key={index} variant={match.draw ? "" : match.winnerUsername === username ? "success" : "danger"}>
            <Row className='text-center'>
            <div className="fw-bold d-flex">
              <span className='mx-auto'>
                {match.draw 
                ? "Draw"
                : match.winnerUsername === username ? "Victory" : "Defeat"
                }
              </span>
                <Dropdown>
                  <Dropdown.Toggle variant='light'>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleSendFriendRequest(match.winnerUsername !== username ? username! : match.loserUsername)}>Add {match.winnerUsername !== username ? username : match.loserUsername} as friend</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Toggle>
                </Dropdown>
            </div>
            </Row>
            <Row>
                <Col className='d-flex justify-content-around'>
                    <span>
                        {match.winnerUsername + " VS " + match.loserUsername + " | " + formatMatchTimeAgo(match.matchTime)}
                    </span>
                </Col>
            </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
    </div>
  );
};

export default MatchHistoryList;
