import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Authentication Context for Nigerian Tax Calculator
 * (Simplified for Guest Mode - Convex removed)
 */

export interface User {
    userId: string;
    email: string;
    name: string;
    biometricEnabled: boolean;
    imageUrl?: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithBiometrics: () => Promise<void>;
    isBiometricAvailable: boolean;
    enableBiometrics: () => Promise<void>;
    disableBiometrics: () => Promise<void>;
    updateLocalUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Mock user for "Guest" mode
    const [user, setUser] = useState<User | null>({
        userId: "guest_user_id",
        email: "guest@example.com",
        name: "Guest User",
        biometricEnabled: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const appState = useRef(AppState.currentState);
    const backgroundTimestamp = useRef<number | null>(null);

    // No need to check biometrics or load stored user
    useEffect(() => {
        setIsLoading(false);
    }, []);

    // Session timeout logic
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to the foreground!
                if (backgroundTimestamp.current && user) {
                    const elapsed = Date.now() - backgroundTimestamp.current;
                    // 1 minute if biometrics enabled, 2 minutes grace if not
                    const timeoutLimit = user.biometricEnabled ? 60 * 1000 : 120 * 1000;

                    if (elapsed > timeoutLimit) {
                        console.log(`Session timed out (${timeoutLimit / 1000}s).`);
                        backgroundTimestamp.current = null;
                    }
                }
            }

            if (nextAppState.match(/inactive|background/)) {
                backgroundTimestamp.current = Date.now();
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [user]);

    const updateLocalUser = async (updates: Partial<User>) => {
        if (!user) return;
        setUser({ ...user, ...updates });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login: async () => { },
                register: async () => { },
                logout: async () => { },
                loginWithBiometrics: async () => { },
                isBiometricAvailable,
                enableBiometrics: async () => { },
                disableBiometrics: async () => { },
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
