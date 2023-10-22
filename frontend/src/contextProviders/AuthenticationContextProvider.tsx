import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { checkAuthStatus, loginUser } from "../helpers/apiCommunicator";

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

    const logout = async () => {};

    const register = async (username: string, password: string, retypePassword: string) => {};

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
