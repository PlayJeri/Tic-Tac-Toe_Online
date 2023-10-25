import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { checkAuthStatus, loginUser, logoutUser, registerUser } from "../helpers/apiCommunicator";

interface User {
    username: string;
    id: string;
}

interface UserAuth {
    isLoggedIn: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, retypePassword: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<UserAuth | null>(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    useEffect(() => {
        async function checkStatus() {
            const data = await checkAuthStatus();
            if (!data) return
            setUser({ username: data.username, id: data.id });
            setIsLoggedIn(true);
        }
        checkStatus();
    }, []);

    const login = async (username: string, password: string) => {
        const data = await loginUser(username, password);
        if (!data) throw new Error("Login failed");

        setUser({ username: data.username, id: data.id })
        setIsLoggedIn(true);
    };

    const logout = async () => {
        const data = await logoutUser();
        if (!data) {
            throw new Error("Logout failed");
        }
        setUser(null);
        setIsLoggedIn(false);
        window.location.reload();
    };

    const register = async (username: string, password: string, retypePassword: string) => {
        const data = await registerUser(username, password, retypePassword);
        if (!data) throw new Error("Registration failed");

        login(username, password);
    };

    const contextValue = {
        user,
        isLoggedIn,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
