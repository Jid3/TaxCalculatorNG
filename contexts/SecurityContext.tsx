import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface SecurityContextType {
    isLocked: boolean;
    hasPassword: boolean;
    isBiometricEnabled: boolean;
    isBiometricAvailable: boolean;
    unlock: (password: string) => Promise<boolean>;
    authenticateWithBiometrics: () => Promise<boolean>;
    setPassword: (password: string) => Promise<void>;
    setBiometricEnabled: (enabled: boolean) => Promise<void>;
    removeSecurity: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const SECURE_KEYS = {
    PASSWORD: 'local_security_password',
    BIOMETRIC_ENABLED: 'local_security_biometric_enabled',
};

export function SecurityProvider({ children }: { children: ReactNode }) {
    const [isLocked, setIsLocked] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        loadSecuritySettings();
        checkBiometrics();

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    const loadSecuritySettings = async () => {
        try {
            const storedPassword = await SecureStore.getItemAsync(SECURE_KEYS.PASSWORD);
            const biometricPref = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);

            setHasPassword(!!storedPassword);
            setIsBiometricEnabled(biometricPref === 'true');

            if (!!storedPassword) {
                setIsLocked(true);
            }
        } catch (error) {
            console.error('Failed to load security settings', error);
        }
    };

    const checkBiometrics = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/active/) &&
            nextAppState.match(/inactive|background/)
        ) {
            // App went to background, lock it if a password exists
            SecureStore.getItemAsync(SECURE_KEYS.PASSWORD).then(password => {
                if (password) setIsLocked(true);
            });
        }
        appState.current = nextAppState;
    };

    const unlock = async (password: string): Promise<boolean> => {
        try {
            const storedPassword = await SecureStore.getItemAsync(SECURE_KEYS.PASSWORD);
            if (storedPassword === password) {
                setIsLocked(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Unlock failed', error);
            return false;
        }
    };

    const authenticateWithBiometrics = async (): Promise<boolean> => {
        if (!isBiometricAvailable || !isBiometricEnabled) return false;

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Tax Calculator',
                fallbackLabel: 'Use Password',
            });

            if (result.success) {
                setIsLocked(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Biometric auth failed', error);
            return false;
        }
    };

    const setPassword = async (password: string) => {
        await SecureStore.setItemAsync(SECURE_KEYS.PASSWORD, password);
        setHasPassword(true);
        setIsLocked(false);
    };

    const setBiometricEnabled = async (enabled: boolean) => {
        await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED, String(enabled));
        setIsBiometricEnabled(enabled);
    };

    const removeSecurity = async () => {
        await SecureStore.deleteItemAsync(SECURE_KEYS.PASSWORD);
        await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
        setHasPassword(false);
        setIsLocked(false);
        setIsBiometricEnabled(false);
    };

    return (
        <SecurityContext.Provider
            value={{
                isLocked,
                hasPassword,
                isBiometricEnabled,
                isBiometricAvailable,
                unlock,
                authenticateWithBiometrics,
                setPassword,
                setBiometricEnabled,
                removeSecurity,
            }}
        >
            {children}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const context = useContext(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
}
