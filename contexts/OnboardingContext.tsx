import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@taxnaija_onboarding_complete';
const ONBOARDING_PROFILE_KEY = '@taxnaija_onboarding_profile';

export interface OnboardingProfile {
    incomeType: string; // 'salaried' | 'freelancer' | 'business' | 'multiple'
    state: string;
    securityMethod: string; // 'biometric' | 'pin' | 'none'
}

interface OnboardingContextType {
    hasCompletedOnboarding: boolean | null; // null = still loading
    profile: OnboardingProfile | null;
    completeOnboarding: (profile?: OnboardingProfile) => Promise<void>;
    resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
    const [profile, setProfile] = useState<OnboardingProfile | null>(null);

    useEffect(() => {
        loadOnboardingState();
    }, []);

    const loadOnboardingState = async () => {
        try {
            const [completed, profileJson] = await Promise.all([
                AsyncStorage.getItem(ONBOARDING_KEY),
                AsyncStorage.getItem(ONBOARDING_PROFILE_KEY),
            ]);
            setHasCompletedOnboarding(completed === 'true');
            if (profileJson) {
                setProfile(JSON.parse(profileJson));
            }
        } catch (error) {
            console.error('Failed to load onboarding state:', error);
            setHasCompletedOnboarding(false);
        }
    };

    const completeOnboarding = async (newProfile?: OnboardingProfile) => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            if (newProfile) {
                await AsyncStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(newProfile));
                setProfile(newProfile);
            }
            setHasCompletedOnboarding(true);
        } catch (error) {
            console.error('Failed to save onboarding state:', error);
        }
    };

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.multiRemove([ONBOARDING_KEY, ONBOARDING_PROFILE_KEY]);
            setHasCompletedOnboarding(false);
            setProfile(null);
        } catch (error) {
            console.error('Failed to reset onboarding:', error);
        }
    };

    return (
        <OnboardingContext.Provider
            value={{
                hasCompletedOnboarding,
                profile,
                completeOnboarding,
                resetOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
