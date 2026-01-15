import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useSecurity } from '@/contexts/SecurityContext';

export default function LockScreen() {
    const { colors } = useTheme();
    const { unlock, authenticateWithBiometrics, isBiometricEnabled, isBiometricAvailable } = useSecurity();
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isBiometricEnabled && isBiometricAvailable) {
            authenticateWithBiometrics();
        }
    }, [isBiometricEnabled, isBiometricAvailable]);

    const handleUnlock = async () => {
        const success = await unlock(password);
        if (!success) {
            Alert.alert('Error', 'Incorrect PIN');
            setPassword('');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.header}>
                    <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back 😊</Text>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="lock-closed" size={40} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Enter PIN</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Enter your 6-digit PIN to continue
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colors.surface,
                            color: colors.text,
                            borderColor: colors.border
                        }]}
                        placeholder="6-digit PIN"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        keyboardType="numeric"
                        maxLength={6}
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleUnlock}
                    >
                        <Text style={styles.buttonText}>Unlock</Text>
                    </TouchableOpacity>

                    {isBiometricEnabled && isBiometricAvailable && (
                        <TouchableOpacity
                            style={styles.biometricButton}
                            onPress={authenticateWithBiometrics}
                        >
                            <Ionicons name="finger-print" size={32} color={colors.primary} />
                            <Text style={[styles.biometricText, { color: colors.primary }]}>
                                Use Biometrics
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        borderWidth: 1,
        marginBottom: 16,
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    biometricText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
});
