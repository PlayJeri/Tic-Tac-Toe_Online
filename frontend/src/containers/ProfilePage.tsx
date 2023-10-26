import { useEffect, useState } from 'react';
import { ProfileInfo } from '../utils/types';
import { ProfileInfoListComponent } from '../components/ProfileInfo';
import { NavBar } from '../components/NavBar';
import { getProfileData } from '../helpers/apiCommunicator';
import { Col, Container } from 'react-bootstrap';

export const ProfilePage = () => {
    const [userData, setUserData] = useState<ProfileInfo | null>(null);

    useEffect(() => {
        const fetchData = async () => {

            const response = await getProfileData()
            console.log(response)
            setUserData(response);
        }
        fetchData();
    }, [])

    return (
        <>
            <NavBar />
            <Container className='text-white'>
                <h1 className='text-center my-4'>{userData?.username} Profile</h1>
                <Col className='col-6 mx-auto'>
                    {userData 
                    ? 
                    (
                        <ProfileInfoListComponent 
                        wins={userData.wins}
                        losses={userData.losses}
                        secondsPlayed={userData.secondsPlayed}
                        username=''
                        />
                    )
                    :
                    (
                        <p>Loading profile data...</p>
                    )}
                </Col>
            </Container>
        </>
    )
}