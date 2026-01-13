import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { formatCurrency } from '@/utils/taxCalculations';
import { useRouter } from 'expo-router';

import { useTaxHistory } from '@/hooks/useTaxHistory';

export default function MyTaxesScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    const { data: calculations, isLoading, refreshing, refresh, deleteCalculation } = useTaxHistory();

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Calculation",
            "Are you sure you want to delete this saved calculation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCalculation(id);
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete calculation");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.date, { color: colors.textMuted }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.amount, { color: colors.primary }]}>
                        {formatCurrency(item.netIncome)}
                    </Text>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Net Income ({item.incomeType})</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.details}>
                <Text style={[styles.detailText, { color: colors.text }]}>
                    Gross: {formatCurrency(item.grossIncome)}
                </Text>
                <Text style={[styles.detailText, { color: colors.text }]}>
                    Tax: {formatCurrency(item.totalTax)}
                </Text>
            </View>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        header: {
            backgroundColor: colors.surface,
            padding: 20,
            paddingTop: 50,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 13,
            color: colors.textMuted,
        },
        listContent: {
            padding: 16,
        },
        card: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        date: {
            fontSize: 12,
            marginBottom: 4,
        },
        amount: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 2,
        },
        label: {
            fontSize: 12,
        },
        actions: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            padding: 8,
        },
        divider: {
            height: 1,
            marginVertical: 12,
        },
        details: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        detailText: {
            fontSize: 14,
            fontWeight: '500',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 100,
        },
        emptyText: {
            color: colors.textMuted,
            fontSize: 16,
            marginTop: 16,
        },
    });

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Taxes</Text>
                <Text style={styles.headerSubtitle}>This is a list of all your saved taxes</Text>
            </View>

            <FlatList
                data={calculations}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No saved calculations yet</Text>
                    </View>
                }
            />
        </View>
    );
}
