import axios from "axios";
import { FriendListData, MatchHistoryData } from "../utils/types";


export const loginUser = async (username: string, password: string) => {
    try {
        const res = await axios.post("/auth/login", { username, password });
        const data = await res.data;
        return data;
    } catch (error) {
        throw error;
    }
};

export const checkAuthStatus = async () => {
    try {
        const res = await axios.get("/auth/auth-status");
        const data = await res.data;
        return data;
    } catch (error) {
        throw error;
    }
};

export const getProfileData = async () => {
    try {
        const res = await axios.get("/profile/");
        const data = await res.data;
        return data;
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return null;
    }
};

export const getMatchHistory = async () => {
    try {
        const res = await axios.get("/profile/match-history");
        const data: MatchHistoryData[] = await res.data;
        return data;      
    } catch (error) {
        console.error("Error fetching match history:", error);
        return null;
    }
};

export const registerUser = async (username: string, password: string, retypePassword: string) => {
    try {
        const res = await axios.post("/auth/register", { username, password, retypePassword } );
        const data = await res.data;
        return data
    } catch (error) {
        throw error;
    }
};


export const logoutUser = async () => {
    try {
        const res = await axios.post("/auth/logout");
        const data = await res.data;
        return data;
    } catch (error) {
        throw error;
    }
}


export const sendFriendRequest = async (newFriendUsername: string) => {
    try {
        const res = await axios.post("/user/follow", { newFriendUsername });
        const data = await res.data;
        return data;
    } catch (error) {
        throw error;
    }
}


export const fetchFriendRequests = async () => {
    try {
        const res = await axios.get("user/pending");
        const data = await res.data;
        console.log("Request data:", data);
        if (data) return data;
    } catch (error) {
        throw error;
    }
}


export const acceptFriendRequest = async (userId: number) => {
    try {
        const res = await axios.post("user/accept", { friendId: userId });
        if (res.status !== 201) return false;
        return true;
    } catch (error) {
        throw error;
    }
}


export const deleteFriendship = async (userId: number) => {
    try {
        const res = await axios.post("user/remove-friend", { friendId: userId })
        if (res.status !== 204) return false;
        return true;
    } catch (error) {
        throw error;
    }
};


export const getFriendData = async () => {
    try {
        const res = await axios.get("user/friendships");
        if (res.status !== 200) return false;
        const data: FriendListData[] = await res.data;
        return data
    } catch (error) {
        throw error;
    }
};