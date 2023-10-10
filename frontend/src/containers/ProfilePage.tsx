import { useEffect, useState } from 'react';
import { ProfileInfo } from '../utils/types';
import { ProfileInfoListComponent } from '../components/ProfileInfo';
import { NavBar } from '../components/NavBar';

export const ProfilePage = () => {
    const [userData, setUserData] = useState<ProfileInfo | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': "application/json",
            };

            const response = await fetch('http://localhost:3000/profile', {
                 method: 'GET',
                 headers: headers,
            })

            if (!response.ok) {
                throw new Error("Failed to fetch profile data.");
            }
            const data = await response.json();
            setUserData(data);
        }
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