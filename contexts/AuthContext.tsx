import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';


/**
 * Authentication Context for Nigerian Tax Calculator
 * Handles user authentication with email/password and biometric support
 * Tokens are stored securely on device using expo-secure-store
 */

interface User {
    userId: Id<"users">;
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

// Secure storage keys
const STORAGE_KEYS = {
    USER_ID: 'user_id',
    EMAIL: 'user_email',
    PASSWORD: 'user_password', // Stored securely for biometric login
    BIOMETRIC_ENABLED: 'biometric_enabled',
    USER_NAME: 'user_name',
    IMAGE_URL: 'user_image_url',
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    const loginMutation = useMutation(api.users.login);
    const registerMutation = useMutation(api.users.register);
    const updateBiometricMutation = useMutation(api.users.updateBiometricSetting);

    // Check if biometric authentication is available on device
    useEffect(() => {
        checkBiometricAvailability();
        loadStoredUser();
    }, []);

    const checkBiometricAvailability = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
    };

    // Load user from secure storage on app start
    const loadStoredUser = async () => {
        try {
            const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
            const email = await SecureStore.getItemAsync(STORAGE_KEYS.EMAIL);
            const name = await SecureStore.getItemAsync(STORAGE_KEYS.USER_NAME);
            const biometricEnabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
            const imageUrl = await SecureStore.getItemAsync(STORAGE_KEYS.IMAGE_URL);

            if (userId && email) {
                setUser({
                    userId: userId as Id<"users">,
                    email,
                    name: name || '',
                    biometricEnabled: biometricEnabled === 'true',
                    imageUrl: imageUrl || null,
                });
            }
        } catch (error) {
            console.error('Error loading stored user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Login with email and password
    const login = async (email: string, password: string) => {
        try {
            const result = await loginMutation({ email, password });

            // Store credentials securely on device
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, result.userId);
            await SecureStore.setItemAsync(STORAGE_KEYS.EMAIL, result.email);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_NAME, result.name);
            await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORD, password);
            await SecureStore.setItemAsync(
                STORAGE_KEYS.BIOMETRIC_ENABLED,
                result.biometricEnabled.toString()
            );

            setUser(result);
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    // Register new user
    const register = async (email: string, password: string, name: string) => {
        try {
            const result = await registerMutation({ email, password, name });

            // Automatically log in after registration
            await login(email, password);
        } catch (error: any) {
            console.error("Registration failed:", error);
            // Extract the actual error message from Convex error
            const errorMessage = error.data?.message || error.message || 'Registration failed';
            throw new Error(errorMessage);
        }
    };

    // Logout
    const logout = async () => {
        try {
            // Clear the active user session ID (always logs the user out)
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);

            // Check if we should keep credentials for biometric login
            const biometricEnabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);

            // Only clear credentials if biometric is NOT enabled
            if (biometricEnabled !== 'true') {
                await SecureStore.deleteItemAsync(STORAGE_KEYS.EMAIL);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORD);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_NAME);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.IMAGE_URL);
            }

            setUser(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Login with biometrics
    const loginWithBiometrics = async () => {
        if (!isBiometricAvailable) {
            throw new Error('Biometric authentication is not available on this device');
        }

        try {
            // Prompt for biometric authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access Tax Calculator',
                fallbackLabel: 'Use password instead',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Retrieve stored credentials
                const email = await SecureStore.getItemAsync(STORAGE_KEYS.EMAIL);
                const password = await SecureStore.getItemAsync(STORAGE_KEYS.PASSWORD);

                if (email && password) {
                    await login(email, password);
                } else {
                    throw new Error('Please login with your password first to re-enable biometrics');
                }
            } else {
                throw new Error('Biometric authentication failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Biometric login failed');
        }
    };

    // Enable biometric authentication
    const enableBiometrics = async () => {
        if (!isBiometricAvailable) {
            throw new Error('Biometric authentication is not available on this device');
        }

        if (!user) {
            throw new Error('No user logged in');
        }

        try {
            // Test biometric authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Enable biometric login',
                fallbackLabel: 'Cancel',
            });

            if (result.success) {
                // Update backend
                await updateBiometricMutation({
                    userId: user.userId,
                    enabled: true,
                });

                // Update local storage
                await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');

                setUser({ ...user, biometricEnabled: true });
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to enable biometrics');
        }
    };

    // Disable biometric authentication
    const disableBiometrics = async () => {
        if (!user) {
            throw new Error('No user logged in');
        }

        try {
            // Update backend
            await updateBiometricMutation({
                userId: user.userId,
                enabled: false,
            });

            // Update local storage
            await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');

            setUser({ ...user, biometricEnabled: false });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to disable biometrics');
        }
    };

    // Update local user data and persist to storage
    const updateLocalUser = async (updates: Partial<User>) => {
        if (!user) return;

        try {
            // Update SecureStore with new values if provided
            if (updates.name !== undefined) {
                await SecureStore.setItemAsync(STORAGE_KEYS.USER_NAME, updates.name);
            }
            if (updates.email !== undefined) {
                await SecureStore.setItemAsync(STORAGE_KEYS.EMAIL, updates.email);
            }
            if (updates.imageUrl !== undefined) {
                if (updates.imageUrl) {
                    await SecureStore.setItemAsync(STORAGE_KEYS.IMAGE_URL, updates.imageUrl);
                } else {
                    await SecureStore.deleteItemAsync(STORAGE_KEYS.IMAGE_URL);
                }
            }

            // Update local state
            setUser({ ...user, ...updates });
        } catch (error) {
            console.error('Error updating local user data:', error);
            // Don't throw, just log. This is a "nice to have" sync.
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                loginWithBiometrics,
                isBiometricAvailable,
                enableBiometrics,
                disableBiometrics,
                updateLocalUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Protected route wrapper component
export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!user) {
        // Redirect to login - handled by navigation
        return null;
    }

    return <>{children}</>;
}
