import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Authentication Context for Nigerian Tax Calculator
 * (Simplified for Guest Mode)
 */

export interface User {
    userId: string;
    email: string;
    name: string;
    imageUrl?: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    updateLocalUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Mock user for "Guest" mode
    const [user, setUser] = useState<User | null>({
        userId: "guest_user_id",
        email: "guest@example.com",
        name: "Guest User",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const updateLocalUser = async (updates: Partial<User>) => {
        if (!user) return;
        setUser({ ...user, ...updates });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                updateLocalUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
