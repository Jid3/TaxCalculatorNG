import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { formatCurrency } from '@/utils/taxCalculations';
import { useRouter } from 'expo-router';
import { useTaxMode } from '@/contexts/TaxModeContext';
import TaxModeToggle from '@/components/TaxModeToggle';

import { useTaxHistory } from '@/hooks/useTaxHistory';
import { CalculationHistoryItem } from '@/types/taxTypes';

export default function MyTaxesScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const { taxMode } = useTaxMode();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: calculations, isLoading, refreshing, refresh, deleteCalculation } = useTaxHistory();

    // Filter calculations by tax mode
    const filteredCalculations = calculations?.filter(calc =>
        (calc.taxMode || 'personal') === taxMode
    ) || [];

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

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const renderItem = ({ item }: { item: CalculationHistoryItem }) => {
        const isBusiness = item.taxMode === 'business';
        const isExpanded = expandedId === item._id;

        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => toggleExpand(item._id)} activeOpacity={0.7}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.date, { color: colors.textMuted }]}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                            <Text style={[styles.amount, { color: colors.primary }]}>
                                {formatCurrency(item.netIncome ?? 0)}
                            </Text>
                            <Text style={[styles.label, { color: colors.textMuted }]}>
                                Net Income {isBusiness ? `(${item.companySize})` : `(${item.incomeType})`}
                            </Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => handleDelete(item._id)}
                                style={styles.actionButton}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.details}>
                        <Text style={[styles.detailText, { color: colors.text }]}>
                            Gross: {formatCurrency(item.grossIncome ?? 0)}
                        </Text>
                        <Text style={[styles.detailText, { color: colors.text }]}>
                            Tax: {formatCurrency(item.totalTax ?? 0)}
                        </Text>
                    </View>

                    {isBusiness && item.effectiveTaxRate !== undefined && (
                        <Text style={[styles.detailText, { color: colors.textMuted, fontSize: 11, marginTop: 4 }]}>
                            Effective Rate: {item.effectiveTaxRate.toFixed(2)}%
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Expanded Breakdown */}
                {isExpanded && (
                    <View style={styles.expandedSection}>
                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Full Calculation Breakdown
                        </Text>

                        {/* Personal Tax Breakdown */}
                        {!isBusiness && (
                            <>
                                {/* Reliefs */}
                                {(item.pensionRelief || item.nhfRelief || item.nhisRelief || item.lifeInsuranceRelief || item.rentRelief) && (
                                    <>
                                        <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
                                            Reliefs & Deductions:
                                        </Text>
                                        {(item.pensionRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Pension Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.pensionRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.nhfRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>NHF Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.nhfRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.nhisRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>NHIS Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.nhisRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.lifeInsuranceRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Life Insurance</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.lifeInsuranceRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.rentRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Rent Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.rentRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={[styles.breakdownRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border }]}>
                                            <Text style={[styles.breakdownText, { color: colors.text, fontWeight: '600' }]}>Total Reliefs</Text>
                                            <Text style={[styles.breakdownValue, { color: colors.success, fontWeight: '600' }]}>
                                                -{formatCurrency(item.totalReliefs ?? 0)}
                                            </Text>
                                        </View>
                                    </>
                                )}

                                {/* Taxable Income */}
                                <View style={[styles.breakdownRow, { marginTop: 12 }]}>
                                    <Text style={[styles.breakdownText, { color: colors.text, fontWeight: '600' }]}>Taxable Income</Text>
                                    <Text style={[styles.breakdownValue, { color: colors.text, fontWeight: '600' }]}>
                                        {formatCurrency(item.taxableIncome ?? 0)}
                                    </Text>
                                </View>
                            </>
                        )}

                        {/* Business Tax Breakdown */}
                        {isBusiness && (
                            <>
                                {/* Company Info */}
                                <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
                                    Company Information:
                                </Text>
                                <View style={styles.breakdownRow}>
                                    <Text style={[styles.breakdownText, { color: colors.text }]}>Business Type</Text>
                                    <Text style={[styles.breakdownValue, { color: colors.text }]}>
                                        {item.businessType?.charAt(0).toUpperCase()}{item.businessType?.slice(1)}
                                    </Text>
                                </View>

                                {/* Reliefs */}
                                {(item.pensionRelief || item.nhfRelief || item.nhisRelief || item.rentRelief || item.employmentRelief || item.compensationRelief) && (
                                    <>
                                        <Text style={[styles.breakdownLabel, { color: colors.textMuted, marginTop: 12 }]}>
                                            Reliefs & Deductions:
                                        </Text>
                                        {(item.pensionRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Pension</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.pensionRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.nhfRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>NHF</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.nhfRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.nhisRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>NHIS</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.nhisRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.rentRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Rent Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.rentRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.employmentRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Employment Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.employmentRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.compensationRelief ?? 0) > 0 && (
                                            <View style={styles.breakdownRow}>
                                                <Text style={[styles.breakdownText, { color: colors.text }]}>Compensation Relief</Text>
                                                <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                                    -{formatCurrency(item.compensationRelief ?? 0)}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={[styles.breakdownRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border }]}>
                                            <Text style={[styles.breakdownText, { color: colors.text, fontWeight: '600' }]}>Total Reliefs</Text>
                                            <Text style={[styles.breakdownValue, { color: colors.success, fontWeight: '600' }]}>
                                                -{formatCurrency(item.totalReliefs ?? 0)}
                                            </Text>
                                        </View>
                                    </>
                                )}

                                {/* Tax Calculation */}
                                <Text style={[styles.breakdownLabel, { color: colors.textMuted, marginTop: 12 }]}>
                                    Tax Calculation:
                                </Text>
                                <View style={styles.breakdownRow}>
                                    <Text style={[styles.breakdownText, { color: colors.text }]}>Taxable Income</Text>
                                    <Text style={[styles.breakdownValue, { color: colors.text }]}>
                                        {formatCurrency(item.taxableIncome ?? 0)}
                                    </Text>
                                </View>
                                {item.companyIncomeTax !== undefined && (
                                    <View style={styles.breakdownRow}>
                                        <Text style={[styles.breakdownText, { color: colors.text }]}>CIT (30%)</Text>
                                        <Text style={[styles.breakdownValue, { color: colors.danger }]}>
                                            {formatCurrency(item.companyIncomeTax ?? 0)}
                                        </Text>
                                    </View>
                                )}
                                {item.developmentLevy !== undefined && (
                                    <View style={styles.breakdownRow}>
                                        <Text style={[styles.breakdownText, { color: colors.text }]}>Development Levy (4%)</Text>
                                        <Text style={[styles.breakdownValue, { color: colors.danger }]}>
                                            {formatCurrency(item.developmentLevy ?? 0)}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* Total Tax */}
                        <View style={[styles.breakdownRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: colors.border }]}>
                            <Text style={[styles.breakdownText, { color: colors.text, fontWeight: 'bold', fontSize: 16 }]}>Total Tax</Text>
                            <Text style={[styles.breakdownValue, { color: colors.danger, fontWeight: 'bold', fontSize: 16 }]}>
                                {formatCurrency(item.totalTax ?? 0)}
                            </Text>
                        </View>

                        {/* Net Income */}
                        <View style={[styles.breakdownRow, { marginTop: 8 }]}>
                            <Text style={[styles.breakdownText, { color: colors.text, fontWeight: 'bold', fontSize: 16 }]}>Net Income</Text>
                            <Text style={[styles.breakdownValue, { color: colors.primary, fontWeight: 'bold', fontSize: 16 }]}>
                                {formatCurrency(item.netIncome ?? 0)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Expand/Collapse Toggle at Bottom */}
                <TouchableOpacity
                    onPress={() => toggleExpand(item._id)}
                    style={styles.expandToggle}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.expandToggleText, { color: colors.primary }]}>
                        {isExpanded ? 'Hide Details' : 'View Full Breakdown'}
                    </Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={colors.primary}
                        style={{ marginLeft: 4 }}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        header: {
            backgroundColor: colors.surface,
            padding: 10,
            paddingTop: 40,
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
        expandedSection: {
            paddingTop: 8,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
        },
        breakdownLabel: {
            fontSize: 13,
            fontWeight: '600',
            marginTop: 8,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        breakdownRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 6,
        },
        breakdownText: {
            fontSize: 14,
        },
        breakdownValue: {
            fontSize: 14,
            fontWeight: '500',
        },
        expandToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            marginTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        expandToggleText: {
            fontSize: 14,
            fontWeight: '600',
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
                <Text style={styles.headerSubtitle}>
                    {taxMode === 'personal' ? 'Personal' : 'Business'} tax calculations
                </Text>
            </View>

            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <TaxModeToggle />
            </View>

            <FlatList
                data={filteredCalculations}
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
                        <Text style={styles.emptyText}>
                            No saved {taxMode === 'personal' ? 'personal' : 'business'} calculations yet
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
