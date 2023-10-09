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

    const formatGameTime = (timePlayedSeconds: number): string =>  {
      const hours = Math.floor(timePlayedSeconds / 3600);
      const minutes = Math.floor((timePlayedSeconds % 3600) / 60);
      const seconds = timePlayedSeconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return (
        <>
        <NavBar />
        <div className="container text-white">
        <h1 className='text-center my-4'>{userData?.username} Profile</h1>
      {userData ? (
        <div className="col-6 mx-auto">
        <ul className="list-group border-success">
        <li className="list-group-item border-black d-flex justify-content-between align-items-center">
          Wins
          <span className="badge bg-primary rounded-pill">{userData.wins}</span>
        </li>
        <li className="list-group-item border-black d-flex justify-content-between align-items-center">
          Losses
          <span className="badge bg-primary rounded-pill">{userData.losses}</span>
        </li>
        <li className="list-group-item border-black d-flex justify-content-between align-items-center">
          Time Played
          <span className="badge bg-primary rounded-pill">{formatGameTime(userData.secondsPlayed)}</span>
        </li>
      </ul>
        </div>
      ) : (
        <p>Loading profile data...</p>
        )}
        </div>
        </>
    )
}