import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface SecurityContextType {
    isLocked: boolean;
    hasPassword: boolean;
    isBiometricEnabled: boolean;
    isBiometricAvailable: boolean;
    lockTimeout: number;
    unlock: (password: string) => Promise<boolean>;
    authenticateWithBiometrics: () => Promise<boolean>;
    setPassword: (password: string) => Promise<void>;
    setBiometricEnabled: (enabled: boolean) => Promise<void>;
    setLockTimeout: (timeout: number) => Promise<void>;
    removeSecurity: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const SECURE_KEYS = {
    PASSWORD: 'local_security_password',
    BIOMETRIC_ENABLED: 'local_security_biometric_enabled',
    LOCK_TIMEOUT: 'local_security_lock_timeout',
    BACKGROUND_TIMESTAMP: 'local_security_background_timestamp',
};

export function SecurityProvider({ children }: { children: ReactNode }) {
    const [isLocked, setIsLocked] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [lockTimeout, setLockTimeoutState] = useState(60000); // Default: 1 minute
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
            const storedTimeout = await AsyncStorage.getItem(SECURE_KEYS.LOCK_TIMEOUT);

            setHasPassword(!!storedPassword);
            setIsBiometricEnabled(biometricPref === 'true');
            setLockTimeoutState(storedTimeout ? parseInt(storedTimeout, 10) : 60000);

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

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/active/) &&
            nextAppState.match(/inactive|background/)
        ) {
            // App went to background, store the timestamp
            const password = await SecureStore.getItemAsync(SECURE_KEYS.PASSWORD);
            if (password) {
                await AsyncStorage.setItem(SECURE_KEYS.BACKGROUND_TIMESTAMP, Date.now().toString());
            }
        } else if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            // App came back to foreground, check if timeout elapsed
            const password = await SecureStore.getItemAsync(SECURE_KEYS.PASSWORD);
            if (password) {
                const backgroundTimestamp = await AsyncStorage.getItem(SECURE_KEYS.BACKGROUND_TIMESTAMP);
                if (backgroundTimestamp) {
                    const elapsedTime = Date.now() - parseInt(backgroundTimestamp, 10);
                    if (elapsedTime >= lockTimeout) {
                        setIsLocked(true);
                    }
                    // Clear the timestamp
                    await AsyncStorage.removeItem(SECURE_KEYS.BACKGROUND_TIMESTAMP);
                }
            }
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
                fallbackLabel: 'Use PIN',
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

    const setLockTimeout = async (timeout: number) => {
        await AsyncStorage.setItem(SECURE_KEYS.LOCK_TIMEOUT, timeout.toString());
        setLockTimeoutState(timeout);
    };

    const removeSecurity = async () => {
        await SecureStore.deleteItemAsync(SECURE_KEYS.PASSWORD);
        await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
        await AsyncStorage.removeItem(SECURE_KEYS.LOCK_TIMEOUT);
        await AsyncStorage.removeItem(SECURE_KEYS.BACKGROUND_TIMESTAMP);
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
                lockTimeout,
                unlock,
                authenticateWithBiometrics,
                setPassword,
                setBiometricEnabled,
                setLockTimeout,
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
