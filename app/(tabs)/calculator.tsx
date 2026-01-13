import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useAuth } from '@/contexts/AuthContext';
import {
    calculateTax,
    calculateTaxFromMonthly,
    calculateTaxFromWeekly,
    formatCurrency,
    calculateStandardReliefs,
    formatNumber,
    parseNumber,
} from '@/utils/taxCalculations';
import { TaxBreakdown as TaxBreakdownType, TaxReliefs } from '@/types/taxTypes';
import { useTaxHistory } from '@/hooks/useTaxHistory';

export default function CalculatorScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const { addCalculation } = useTaxHistory();


    // Income type toggle
    const [incomeType, setIncomeType] = useState<'monthly' | 'annual' | 'weekly'>('monthly');

    // Income inputs
    const [income, setIncome] = useState('');

    // Relief inputs
    const [pension, setPension] = useState('');
    const [nhf, setNhf] = useState('');
    const [nhis, setNhis] = useState('');
    const [lifeInsurance, setLifeInsurance] = useState('');
    const [rentPaid, setRentPaid] = useState('');

    // Auto-calculate reliefs toggle
    const [autoCalculateReliefs, setAutoCalculateReliefs] = useState(false);

    // Results
    const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdownType | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [isReliefsExpanded, setIsReliefsExpanded] = useState(false);

    // Auto-calculate pension and NHF when enabled
    useEffect(() => {
        if (autoCalculateReliefs && income) {
            const incomeValue = parseNumber(income);
            const reliefs = calculateStandardReliefs(incomeValue);
            setPension(formatNumber(reliefs.pension));
            setNhf(formatNumber(reliefs.nhf));
        }
    }, [autoCalculateReliefs, income]);

    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<any>(null);

    // URL Params for Edit Mode
    const { editMode: paramEditMode, calculationId, ...params } = useGlobalSearchParams();

    useEffect(() => {
        // If reset is passed, clear form
        if (params.reset === 'true') {
            handleReset();
            if (params.incomeType) {
                setIncomeType(params.incomeType as 'monthly' | 'annual' | 'weekly');
            }
            return;
        }

        if (paramEditMode === 'true' && calculationId) {
            setEditMode(true);
            setEditingId(calculationId);

            // Populate fields from params
            if (params.income) setIncome(formatNumber(params.income as string));
            if (params.incomeType) setIncomeType(params.incomeType as 'monthly' | 'annual' | 'weekly');
            if (params.pension) setPension(formatNumber(params.pension as string));
            if (params.nhf) setNhf(formatNumber(params.nhf as string));
            if (params.nhis) setNhis(formatNumber(params.nhis as string));
            if (params.lifeInsurance) setLifeInsurance(formatNumber(params.lifeInsurance as string));
            if (params.rentPaid) setRentPaid(formatNumber(params.rentPaid as string));

            // We should probably auto-calculate immediately to show results if we have data
            // But for now let the user tap calculate to verify
        }
    }, [paramEditMode, calculationId, params.reset, params.incomeType]);


    const handleCalculate = () => {
        const incomeValue = parseNumber(income);

        if (incomeValue <= 0) {
            Alert.alert('Error', 'Please enter a valid income amount');
            return;
        }

        const reliefs: TaxReliefs = {
            pension: parseNumber(pension),
            nhf: parseNumber(nhf),
            nhis: parseNumber(nhis),
            lifeInsurance: parseNumber(lifeInsurance),
            rentPaid: parseNumber(rentPaid),
        };

        let result: TaxBreakdownType;

        if (incomeType === 'monthly') {
            result = calculateTaxFromMonthly(incomeValue, reliefs);
        } else if (incomeType === 'weekly') {
            result = calculateTaxFromWeekly(incomeValue, reliefs);
        } else {
            result = calculateTax(incomeValue, reliefs);
        }

        setTaxBreakdown(result);
        setShowResults(true);
    };

    const handleSave = async () => {
        if (!user || !taxBreakdown) return;

        try {
            const optimisticData = {
                grossIncome: taxBreakdown.grossIncome,
                incomeType,
                pensionRelief: taxBreakdown.pensionRelief,
                nhfRelief: taxBreakdown.nhfRelief,
                nhisRelief: taxBreakdown.nhisRelief,
                lifeInsuranceRelief: taxBreakdown.lifeInsuranceRelief,
                rentRelief: taxBreakdown.rentRelief,
                taxableIncome: taxBreakdown.taxableIncome,
                totalTax: taxBreakdown.totalTax,
                netIncome: taxBreakdown.netIncome,
                ...(editMode ? { _id: editingId } : {})
            };

            // Save locally
            addCalculation(optimisticData);

            Alert.alert('Success', editMode ? 'Calculation updated successfully' : 'Calculation saved to My Taxes');

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save calculation');
        }
    };

    const handleReset = () => {
        setIncome('');
        setPension('');
        setNhf('');
        setNhis('');
        setLifeInsurance('');
        setRentPaid('');
        setTaxBreakdown(null);
        setShowResults(false);
        setEditMode(false);
        setEditingId(null);
        router.setParams({ editMode: '', calculationId: '', reset: '' }); // Clear params
    };

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
        content: {
            padding: 16,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        reliefHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
        },
        reliefContent: {
            marginTop: 16,
        },
        incomeTypeToggle: {
            flexDirection: 'row',
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
        },
        toggleButton: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderRadius: 8,
        },
        toggleButtonActive: {
            backgroundColor: colors.primary,
        },
        toggleButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textMuted,
        },
        toggleButtonTextActive: {
            color: '#ffffff',
        },
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: colors.text,
        },
        autoCalculateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            padding: 12,
            backgroundColor: colors.bg,
            borderRadius: 12,
        },
        autoCalculateText: {
            fontSize: 14,
            color: colors.text,
            flex: 1,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        calculateButton: {
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
        },
        calculateButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        resetButton: {
            flex: 1,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
        },
        resetButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        resultCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: colors.primary,
        },
        resultHeader: {
            alignItems: 'center',
            marginBottom: 24,
        },
        resultTitle: {
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: 8,
        },
        resultAmount: {
            fontSize: 36,
            fontWeight: 'bold',
            color: colors.primary,
        },
        resultSubtitle: {
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 4,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 16,
        },
        breakdownRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        breakdownLabel: {
            fontSize: 14,
            color: colors.textMuted,
        },
        breakdownValue: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        bracketCard: {
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
        },
        bracketHeader: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        bracketDetails: {
            fontSize: 12,
            color: colors.textMuted,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTopWidth: 2,
            borderTopColor: colors.border,
            marginTop: 8,
        },
        totalLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        totalValue: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary,
        },
        saveButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            marginTop: 16,
        },
        saveButtonText: {
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 14,
        },
    });


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tax Calculator</Text>
                <Text style={styles.headerSubtitle}>
                    Calculate your tax based on 2026 Nigeria Tax Act
                </Text>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content}>
                    {/* Income Input Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Income Information</Text>

                        {/* Income Type Toggle */}
                        <View style={styles.incomeTypeToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    incomeType === 'monthly' && styles.toggleButtonActive,
                                ]}
                                onPress={() => setIncomeType('monthly')}
                            >
                                <Text
                                    style={[
                                        styles.toggleButtonText,
                                        incomeType === 'monthly' && styles.toggleButtonTextActive,
                                    ]}
                                >
                                    Monthly
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    incomeType === 'annual' && styles.toggleButtonActive,
                                ]}
                                onPress={() => setIncomeType('annual')}
                            >
                                <Text
                                    style={[
                                        styles.toggleButtonText,
                                        incomeType === 'annual' && styles.toggleButtonTextActive,
                                    ]}
                                >
                                    Annual
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    incomeType === 'weekly' && styles.toggleButtonActive,
                                ]}
                                onPress={() => setIncomeType('weekly')}
                            >
                                <Text
                                    style={[
                                        styles.toggleButtonText,
                                        incomeType === 'weekly' && styles.toggleButtonTextActive,
                                    ]}
                                >
                                    Weekly
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {incomeType === 'monthly' ? 'Monthly Income' : incomeType === 'weekly' ? 'Weekly Income' : 'Annual Income'} (₦)
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.textMuted}
                                value={income}
                                onChangeText={(text) => setIncome(formatNumber(text))}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Tax Reliefs Card */}
                    <View style={[styles.card, { paddingBottom: isReliefsExpanded ? 20 : 12 }]}>
                        <TouchableOpacity
                            style={styles.reliefHeader}
                            onPress={() => setIsReliefsExpanded(!isReliefsExpanded)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cardTitle}>Tax Reliefs & Deductions</Text>
                            <Ionicons
                                name={isReliefsExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.textMuted}
                            />
                        </TouchableOpacity>

                        {isReliefsExpanded && (
                            <View style={styles.reliefContent}>
                                <View style={styles.autoCalculateRow}>
                                    <Text style={styles.autoCalculateText}>
                                        Auto-calculate Pension (8%) & NHF (2.5%)
                                    </Text>
                                    <Switch
                                        value={autoCalculateReliefs}
                                        onValueChange={setAutoCalculateReliefs}
                                        trackColor={{ false: colors.border, true: colors.primary }}
                                        thumbColor="#ffffff"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Pension Contribution (₦)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter pension amount"
                                        placeholderTextColor={colors.textMuted}
                                        value={pension}
                                        onChangeText={(text) => setPension(formatNumber(text))}
                                        keyboardType="numeric"
                                        editable={!autoCalculateReliefs}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>National Housing Fund (NHF) Contribution (₦)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter NHF amount"
                                        placeholderTextColor={colors.textMuted}
                                        value={nhf}
                                        onChangeText={(text) => setNhf(formatNumber(text))}
                                        keyboardType="numeric"
                                        editable={!autoCalculateReliefs}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>NHIS Contribution (₦)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter NHIS amount (optional)"
                                        placeholderTextColor={colors.textMuted}
                                        value={nhis}
                                        onChangeText={(text) => setNhis(formatNumber(text))}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Life Insurance Premium (₦)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter life insurance (optional)"
                                        placeholderTextColor={colors.textMuted}
                                        value={lifeInsurance}
                                        onChangeText={(text) => setLifeInsurance(formatNumber(text))}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Annual Rent Paid (₦)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter annual rent (optional)"
                                        placeholderTextColor={colors.textMuted}
                                        value={rentPaid}
                                        onChangeText={(text) => setRentPaid(formatNumber(text))}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
                            <Text style={styles.calculateButtonText}>Calculate Tax</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Results */}
                    {showResults && taxBreakdown && (
                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultTitle}>Your Net Income</Text>
                                <Text style={styles.resultAmount}>
                                    {formatCurrency(taxBreakdown.netIncome)}
                                </Text>
                                <Text style={styles.resultSubtitle}>
                                    After tax deduction
                                </Text>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: editMode ? colors.primary : colors.success }]}
                                    onPress={handleSave}
                                >
                                    <Ionicons name={editMode ? "save" : "bookmark"} size={18} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveButtonText}>{editMode ? "Update Calculation" : "Save to My Taxes"}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.cardTitle}>Income Breakdown</Text>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Gross Income</Text>
                                <Text style={styles.breakdownValue}>
                                    {formatCurrency(taxBreakdown.grossIncome)}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.cardTitle}>Reliefs & Allowances</Text>
                            {taxBreakdown.pensionRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>Pension Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(taxBreakdown.pensionRelief)}
                                    </Text>
                                </View>
                            )}
                            {taxBreakdown.nhfRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>NHF Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(taxBreakdown.nhfRelief)}
                                    </Text>
                                </View>
                            )}
                            {taxBreakdown.nhisRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>NHIS Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(taxBreakdown.nhisRelief)}
                                    </Text>
                                </View>
                            )}
                            {taxBreakdown.lifeInsuranceRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>Life Insurance Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(taxBreakdown.lifeInsuranceRelief)}
                                    </Text>
                                </View>
                            )}
                            {taxBreakdown.rentRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <View>
                                        <Text style={styles.breakdownLabel}>Rent Relief</Text>
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>(20% of annual rent)</Text>
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(taxBreakdown.rentRelief)}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Reliefs</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(taxBreakdown.totalReliefs)}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.cardTitle}>Tax Calculation</Text>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Taxable Income</Text>
                                <Text style={styles.breakdownValue}>
                                    {formatCurrency(taxBreakdown.taxableIncome)}
                                </Text>
                            </View>

                            {taxBreakdown.taxPerBracket.map((bracket, index) => (
                                <View key={index} style={styles.bracketCard}>
                                    <Text style={styles.bracketHeader}>{bracket.bracket}</Text>
                                    <Text style={styles.bracketDetails}>
                                        {formatCurrency(bracket.taxableAmount)} × {bracket.rate}% ={' '}
                                        {formatCurrency(bracket.tax)}
                                    </Text>
                                </View>
                            ))}

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Tax</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(taxBreakdown.totalTax)}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
