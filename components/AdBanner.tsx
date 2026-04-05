import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

/**
 * AdMob Banner Ad Component
 * 
 * A user-friendly banner ad that:
 * - Shows a loading indicator while the ad loads
 * - Gracefully hides itself if an ad fails to load
 * - Doesn't disrupt the user experience
 * 
 * For production:
 * 1. Create a Banner Ad Unit in your AdMob Console
 * 2. Replace the Ad Unit ID below with your actual ID
 */

interface AdBannerProps {
    size?: BannerAdSize;
    unitId?: string;
}

// IMPORTANT: Replace with your actual Ad Unit ID for production
// Using test Ad Unit ID for now - replace with real ID before publishing
const AD_UNIT_IDS = {
    android: 'ca-app-pub-2599860932009835/8701688228', // Real Banner ID
};

export function AdBanner({ size = BannerAdSize.BANNER, unitId }: AdBannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const defaultAdUnitId = Platform.select(AD_UNIT_IDS);
    const adUnitId = unitId || defaultAdUnitId;

    // Don't show anything if no ad unit configured or if ad failed
    if (!adUnitId || hasError) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Loading indicator - shows while ad is loading */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#999" />
                </View>
            )}

            {/* Banner Ad */}
            <View style={isLoading ? styles.hidden : styles.visible}>
                <BannerAd
                    unitId={adUnitId}
                    size={size}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                    onAdLoaded={() => {
                        setIsLoading(false);
                        console.log('✅ Banner ad loaded successfully');
                    }}
                    onAdFailedToLoad={(error) => {
                        // Silently hide the ad container if it fails
                        setIsLoading(false);
                        setHasError(true);
                        console.log('Ad not available, hiding banner');
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 50, // Minimum height to prevent layout jumps
    },
    loadingContainer: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hidden: {
        opacity: 0,
        position: 'absolute',
    },
    visible: {
        opacity: 1,
    },
});

