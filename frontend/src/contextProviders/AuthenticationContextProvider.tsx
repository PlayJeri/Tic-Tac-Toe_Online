import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { checkAuthStatus, loginUser, logoutUser, registerUser } from "../helpers/apiCommunicator";

// Define the interface of the user object
interface User {
    username: string;
    id: string;
}

// Define the interface of the authentication context
interface UserAuth {
    isLoggedIn: boolean; // Indicates whether a user is authenticated or not
    user: User | null; // Contains user information if authenticated, or null if not
    login: (username: string, password: string) => Promise<any>; // Function to log in a user
    register: (username: string, password: string, retypePassword: string) => Promise<any>; // Function to register a user
    logout: () => Promise<any>; // Function to log out a user
}

// Create an authentication context with an initial value of null
const AuthContext = createContext<UserAuth | null>(null);

// Custom hook to access the authentication context
export const useAuthContext = () => useContext(AuthContext);

// AuthProvider component wraps the entire application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // State to manage user information and authentication status
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // UseEffect to check the authentication status when the component mounts
    useEffect(() => {
        async function checkStatus() {
            const data = await checkAuthStatus();
            if (data) {
                setUser({ username: data.username, id: data.id });
                setIsLoggedIn(true);
            }
        }
        checkStatus();
    }, []);

    // Function to log in a user
    const login = async (username: string, password: string) => {
        const data = await loginUser(username, password);
        if (!data) {
            throw new Error("Login failed");
        }
        setUser({ username: data.username, id: data.id });
        setIsLoggedIn(true);
    };

    // Function to log out a user
    const logout = async () => {
        const data = await logoutUser();
        if (!data) {
            throw new Error("Logout failed");
        }
        setUser(null);
        setIsLoggedIn(false);
        window.location.reload(); // Refresh the page after logout
    };

    // Function to register a user
    const register = async (username: string, password: string, retypePassword: string) => {
        try {
            const data = await registerUser(username, password, retypePassword);
            login(username, password); // Automatically log in after successful registration

            // Redirect to the homepage after a brief delay
            setTimeout(() => {
                window.location.replace("/");
            }, 2000);
            return data;
        } catch (error) {
            throw error;
        }
    };

    // Create the context value to provide to the context consumers
    const contextValue = {
        user,
        isLoggedIn,
        login,
        logout,
        register
    };

    // Return the AuthProvider with the context value wrapping the children
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
 