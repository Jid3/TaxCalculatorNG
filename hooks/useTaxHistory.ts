import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';

const CACHE_KEY = 'tax_history_cache';

export function useTaxHistory() {
    const { user } = useAuth();
    const [cachedHistory, setCachedHistory] = useState<any[] | null>(null);

    // Fetch from Convex
    const remoteHistory = useQuery(api.calculations.getCalculationHistory,
        user ? { userId: user.userId } : "skip"
    );

    // Initial load from cache
    useEffect(() => {
        const loadCache = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(CACHE_KEY);
                if (jsonValue != null) {
                    setCachedHistory(JSON.parse(jsonValue));
                }
            } catch (e) {
                console.error("Failed to load tax history cache", e);
            }
        };
        loadCache();
    }, []);

    // Sync remote data to cache
    useEffect(() => {
        if (remoteHistory) {
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remoteHistory))
                .catch(e => console.error("Failed to save tax history cache", e));
        }
    }, [remoteHistory]);

    // Return remote data if available (freshest), otherwise cache, otherwise undefined (loading)
    // If remote is undefined (loading), and we have cache, show cache!
    // If remote is defined, show remote.

    const data = remoteHistory === undefined ? cachedHistory : remoteHistory;
    const isLoading = data === null && remoteHistory === undefined;

    const addOptimisticCalculation = async (newCalc: any) => {
        // Create a temporary ID if not provided
        const optimisticEntry = {
            ...newCalc,
            _id: newCalc._id || `temp_${Date.now()}`,
            _creationTime: Date.now(),
        };

        const updatedHistory = [optimisticEntry, ...(data || [])];
        setCachedHistory(updatedHistory);

        try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Failed to update optimistic cache", e);
        }
    };

    return {
        data,
        isLoading,
        isUsingCache: remoteHistory === undefined && cachedHistory !== null,
        addOptimisticCalculation
    };
}
