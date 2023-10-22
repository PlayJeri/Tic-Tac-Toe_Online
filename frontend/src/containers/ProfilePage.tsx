import { useEffect, useState } from 'react';
import { ProfileInfo } from '../utils/types';
import { ProfileInfoListComponent } from '../components/ProfileInfo';
import { NavBar } from '../components/NavBar';
import { getProfileData } from '../helpers/apiCommunicator';

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
        <div className="container text-white">
        <h1 className='text-center my-4'>{userData?.username} Profile</h1>
        {userData ? (
          <ProfileInfoListComponent 
            wins={userData.wins}
            losses={userData.losses}
            secondsPlayed={userData.secondsPlayed}
            username=''
        />
      ) : (
        <p>Loading profile data...</p>
        )}
        </div>
        </>
    )
}