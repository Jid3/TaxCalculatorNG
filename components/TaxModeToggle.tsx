import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useTaxMode } from '@/contexts/TaxModeContext';

export default function TaxModeToggle() {
    const { colors } = useTheme();
    const { taxMode, toggleTaxMode } = useTaxMode();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            padding: 4,
            gap: 12,
            marginBottom: 16,
        },
        toggleButton: {
            flex: 1,
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            gap: 6,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        toggleButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        toggleButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textMuted,
        },
        toggleButtonTextActive: {
            color: '#ffffff',
        },
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    taxMode === 'personal' && styles.toggleButtonActive,
                ]}
                onPress={() => taxMode !== 'personal' && toggleTaxMode()}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="person-outline"
                    size={16}
                    color={taxMode === 'personal' ? '#ffffff' : colors.textMuted}
                />
                <Text
                    style={[
                        styles.toggleButtonText,
                        taxMode === 'personal' && styles.toggleButtonTextActive,
                    ]}
                >
                    Personal
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    taxMode === 'business' && styles.toggleButtonActive,
                ]}
                onPress={() => taxMode !== 'business' && toggleTaxMode()}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="briefcase-outline"
                    size={16}
                    color={taxMode === 'business' ? '#ffffff' : colors.textMuted}
                />
                <Text
                    style={[
                        styles.toggleButtonText,
                        taxMode === 'business' && styles.toggleButtonTextActive,
                    ]}
                >
                    Business
                </Text>
            </TouchableOpacity>
        </View>
    );
}
