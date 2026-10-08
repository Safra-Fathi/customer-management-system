
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import { apiRequest } from '../api/api';
import type { AuthUser, LoginResponse } from '../types/auth';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface CurrentUserResponse {
    user: AuthUser;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);

const TOKEN_KEY = 'crm_access_token';

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem(TOKEN_KEY),
    );

    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const response = await apiRequest<CurrentUserResponse>(
                    '/auth/me',
                    { token },
                );

                if (!cancelled) {
                    setUser(response.user);
                }
            } catch {
                if (!cancelled) {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadCurrentUser();

        return () => {
            cancelled = true;
        };
    }, [token]);

    async function login(email: string, password: string) {
        const response = await apiRequest<LoginResponse>(
            '/auth/login',
            {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            },
        );

        localStorage.setItem(TOKEN_KEY, response.accessToken);
        setToken(response.accessToken);
        setUser(response.user);
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider',
        );
    }

    return context;
}
