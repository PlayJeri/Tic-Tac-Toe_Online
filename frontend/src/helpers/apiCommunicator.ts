import axios from "axios";
import { MatchHistoryData } from "../utils/types";


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