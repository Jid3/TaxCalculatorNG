import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Index() {
    const router = useRouter();
    const { hasCompletedOnboarding } = useOnboarding();

    useEffect(() => {
        // Wait until the onboarding state is loaded (not null)
        if (hasCompletedOnboarding === null) return;

        if (hasCompletedOnboarding) {
            router.replace('/(tabs)');
        } else {
            router.replace('/onboarding' as any);
        }
    }, [hasCompletedOnboarding]);

    return null;
}
