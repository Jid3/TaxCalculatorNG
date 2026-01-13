import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'tax_history_cache';

interface TaxHistoryContextType {
    data: any[] | null;
    isLoading: boolean;
    refreshing: boolean;
    refresh: () => Promise<void>;
    addCalculation: (newCalc: any) => Promise<void>;
    deleteCalculation: (id: string) => Promise<void>;
}

const TaxHistoryContext = createContext<TaxHistoryContextType | undefined>(undefined);

export function TaxHistoryProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(CACHE_KEY);
            if (jsonValue != null) {
                setData(JSON.parse(jsonValue));
            } else {
                setData([]);
            }
        } catch (e) {
            console.error("Failed to load tax history", e);
            setData([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const refresh = async () => {
        setRefreshing(true);
        await loadHistory();
    };

    const addCalculation = async (newCalc: any) => {
        const entry = {
            ...newCalc,
            _id: Date.now().toString(),
            createdAt: Date.now(),
        };

        const updatedHistory = [entry, ...(data || [])];
        setData(updatedHistory); // Optimistic update

        try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Failed to save calculation", e);
            // Revert on error if necessary
        }
    };

    const deleteCalculation = async (id: string) => {
        if (!data) return;

        const updatedHistory = data.filter(item => item._id !== id);
        setData(updatedHistory); // Optimistic update

        try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Failed to delete calculation", e);
        }
    };

    return (
        <TaxHistoryContext.Provider
            value={{
                data,
                isLoading,
                refreshing,
                refresh,
                addCalculation,
                deleteCalculation,
            }}
        >
            {children}
        </TaxHistoryContext.Provider>
    );
}

export function useTaxHistory() {
    const context = useContext(TaxHistoryContext);
    if (context === undefined) {
        throw new Error('useTaxHistory must be used within a TaxHistoryProvider');
    }
    return context;
}
