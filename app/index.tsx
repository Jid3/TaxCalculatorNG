import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        // Always redirect to tabs
        router.replace('/(tabs)');
    }, []);

    return null;
}
