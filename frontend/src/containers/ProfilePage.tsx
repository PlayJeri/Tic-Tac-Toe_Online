import { useEffect, useState } from 'react';
import { ProfileInfo } from '../utils/types';
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
        <h1>User Profile</h1>
      {userData ? (
        <div>
          <p>Username: {userData.username}</p>
          <p>Wins: {userData.wins}</p>
          <p>Losses: {userData.losses}</p>
        </div>
      ) : (
        <p>Loading profile data...</p>
      )}
        </>
    )
}