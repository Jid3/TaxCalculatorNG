import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(tabs)';

        if (!user && inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/login');
        } else if (user && !inAuthGroup) {
            // Redirect to tabs if authenticated
            router.replace('/(tabs)');
        }
    }, [user, isLoading, segments]);

    return null;
}
