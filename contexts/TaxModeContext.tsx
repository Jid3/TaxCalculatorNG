import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaxMode } from '@/types/taxTypes';

interface TaxModeContextType {
    taxMode: TaxMode;
    setTaxMode: (mode: TaxMode) => void;
    toggleTaxMode: () => void;
}

const TaxModeContext = createContext<TaxModeContextType | undefined>(undefined);

const TAX_MODE_STORAGE_KEY = '@tax_calculator_mode';

export function TaxModeProvider({ children }: { children: React.ReactNode }) {
    const [taxMode, setTaxModeState] = useState<TaxMode>('personal');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load tax mode from storage on mount
    useEffect(() => {
        loadTaxMode();
    }, []);

    const loadTaxMode = async () => {
        try {
            const storedMode = await AsyncStorage.getItem(TAX_MODE_STORAGE_KEY);
            if (storedMode === 'personal' || storedMode === 'business') {
                setTaxModeState(storedMode);
            }
        } catch (error) {
            console.error('Failed to load tax mode:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const setTaxMode = async (mode: TaxMode) => {
        try {
            setTaxModeState(mode);
            await AsyncStorage.setItem(TAX_MODE_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Failed to save tax mode:', error);
        }
    };

    const toggleTaxMode = () => {
        const newMode: TaxMode = taxMode === 'personal' ? 'business' : 'personal';
        setTaxMode(newMode);
    };

    // Don't render children until mode is loaded
    if (!isLoaded) {
        return null;
    }

    return (
        <TaxModeContext.Provider value={{ taxMode, setTaxMode, toggleTaxMode }}>
            {children}
        </TaxModeContext.Provider>
    );
}

export function useTaxMode() {
    const context = useContext(TaxModeContext);
    if (context === undefined) {
        throw new Error('useTaxMode must be used within a TaxModeProvider');
    }
    return context;
}
