import { useEffect, useState } from 'react';
import { FriendListData, MatchHistoryData, ProfileInfo } from '../utils/types';
import { ProfileInfoListComponent } from '../components/ProfileInfo';
import { NavBar } from '../components/NavBar';
import { fetchFriendRequests, getFriendData, getMatchHistory, getProfileData } from '../helpers/apiCommunicator';
import { Col, Container, Row } from 'react-bootstrap';
import FriendList from '../components/FriendList';
import MatchHistoryList from '../components/MatchHistoryList';


export const ProfilePage = () => {
    const [userData, setUserData] = useState<ProfileInfo | null>(null);
    const [matchHistoryData, setMatchHistoryData] = useState<MatchHistoryData[] | null>(null);
    const [friendData, setFriendData] = useState<FriendListData[]>([]);
    const [pendingFriendData, setPendingFriendData] = useState<FriendListData[]>([]);

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

            const friendDataResponse = await getFriendData();
            if (friendDataResponse) {
                setFriendData(friendDataResponse);
            }

            const pendingFriendResponse = await fetchFriendRequests();
            if (pendingFriendResponse) {
                setPendingFriendData(pendingFriendResponse);
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
                <Col lg={4} md={6} sm={10} xs={12} className='py-3'>
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
                <Col lg={4} md={6} sm={10} xs={12} className='py-3'>
                    {matchHistoryData ? (
                        <MatchHistoryList 
                        matchHistory={matchHistoryData}
                        username={userData?.username}
                        />
                    ) : (
                        <p>Loading match history data...</p>
                    )}
                </Col>
                <Col lg={4} md={6} sm={10} xs={12} className='py-3'>
                    {friendData ? (
                        <FriendList
                            friendList={friendData}
                            pendingFriendList={pendingFriendData}
                            setPendingFriendList={setPendingFriendData}
                            setFriendList={setFriendData}
                        />
                    ) : (
                        <p>Loading friend data...</p>
                    )}
                </Col>
                </Row>
            </Container>
        </>
    )
}