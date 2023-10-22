import axios from "axios";


export const loginUser = async (username: string, password: string) => {
    console.log('login user', username, password);
    const res = await axios.post("/auth/login", { username, password });
    if (res.status !== 200) {
        throw new Error("Login failed");
    }
    const data = await res.data;
    console.log(data);
    return data;
};

export const checkAuthStatus = async () => {
    const res = await axios.get("/auth/auth-status");
    if (res.status !== 200) {
        throw new Error("Login failed");
    }
    const data = await res.data;
    return data;
};

export const getProfileData = async () => {
    const res = await axios.get("/profile/");
    if (res.status !== 200) {
        throw new Error("Getting profile data failed");
    }
    const data = await res.data;
    return data;
};