import axios from "axios";


export const loginUser = async (username: string, password: string) => {
    try {
        console.log('login user', username, password);
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
        throw error;
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