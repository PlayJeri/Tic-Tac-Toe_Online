import { useEffect, useState } from 'react';
import { MatchHistoryData, ProfileInfo } from '../utils/types';
import { ProfileInfoListComponent } from '../components/ProfileInfo';
import { NavBar } from '../components/NavBar';
import { getMatchHistory, getProfileData } from '../helpers/apiCommunicator';
import { Col, Container, Row } from 'react-bootstrap';
import MatchHistoryList from '../components/MatchHistoryList';


export const ProfilePage = () => {
    const [userData, setUserData] = useState<ProfileInfo | null>(null);
    const [matchHistoryData, setMatchHistoryData] = useState<MatchHistoryData[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const profileResponse = await getProfileData();
            if (profileResponse) {
                setUserData(profileResponse);
            }

            const matchHistoryResponse = await getMatchHistory();
            if (matchHistoryResponse) {
                console.log(matchHistoryResponse);
                setMatchHistoryData(matchHistoryResponse);
            }
        }
        fetchData();
    }, [])

    return (
        <>
            <NavBar />
            <Container className='text-white'>
                <h1 className='text-center my-4'>{userData?.username} Profile</h1>
                <Row className='justify-content-center'>
                <Col className='my-3 col-3 col-xl-4 col-lg-5 col-md-6 col-sm-8 col-10'>
                    {userData ? (
                        <ProfileInfoListComponent 
                        wins={userData.wins}
                        losses={userData.losses}
                        draws={userData.draws}
                        secondsPlayed={userData.secondsPlayed}
                        username={userData.username}
                        />
                    ) : (
                        <p>Loading profile data...</p>
                    )}
                </Col>
                <Col className='my-3 col-3 col-xl-4 col-lg-5 col-md-6 col-sm-8 col-10'>
                    {matchHistoryData ? (
                        <MatchHistoryList 
                        matchHistory={matchHistoryData}
                        username={userData?.username}
                        />
                    ) : (
                        <p>Loading match history data...</p>
                    )}
                </Col>
                </Row>
            </Container>
        </>
    )
}