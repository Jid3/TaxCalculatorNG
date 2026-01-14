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
import { useTaxMode } from '@/contexts/TaxModeContext';
import TaxModeToggle from '@/components/TaxModeToggle';
import BusinessCalculatorForm from '@/components/BusinessCalculatorForm';
import {
    calculateTax,
    calculateTaxFromMonthly,
    calculateTaxFromWeekly,
    formatCurrency,
    calculateStandardReliefs,
    formatNumber,
    parseNumber,
} from '@/utils/taxCalculations';
import { calculateBusinessTax } from '@/utils/businessTaxCalculations';
import {
    TaxBreakdown as TaxBreakdownType,
    TaxReliefs,
    BusinessTaxBreakdown,
    BusinessTaxReliefs,
    CompanySize,
    BusinessType,
    CustomDeduction,
} from '@/types/taxTypes';
import { useTaxHistory } from '@/hooks/useTaxHistory';

export default function CalculatorScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const { addCalculation } = useTaxHistory();
    const { taxMode } = useTaxMode();

    // Income type toggle (for personal tax)
    const [incomeType, setIncomeType] = useState<'monthly' | 'annual' | 'weekly'>('monthly');

    // Income inputs
    const [income, setIncome] = useState('');

    // Personal tax relief inputs
    const [pension, setPension] = useState('');
    const [nhf, setNhf] = useState('');
    const [nhis, setNhis] = useState('');
    const [lifeInsurance, setLifeInsurance] = useState('');
    const [rentPaid, setRentPaid] = useState('');

    // Business tax inputs
    const [companySize, setCompanySize] = useState<CompanySize>('medium');
    const [businessType, setBusinessType] = useState<BusinessType>('general');
    const [employmentRelief, setEmploymentRelief] = useState('');
    const [compensationRelief, setCompensationRelief] = useState('');
    const [customDeductions, setCustomDeductions] = useState<CustomDeduction[]>([]);

    // Auto-calculate reliefs toggle
    const [autoCalculateReliefs, setAutoCalculateReliefs] = useState(false);

    // Results
    const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdownType | null>(null);
    const [businessTaxBreakdown, setBusinessTaxBreakdown] = useState<BusinessTaxBreakdown | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [isReliefsExpanded, setIsReliefsExpanded] = useState(false);

    // Auto-detect company size based on turnover (for business mode)
    useEffect(() => {
        if (taxMode === 'business' && income) {
            const turnover = parseNumber(income);

            if (turnover > 0) {
                // Small: ≤₦50M
                if (turnover <= 50000000) {
                    setCompanySize('small');
                }
                // Large: ≥₦50B
                else if (turnover >= 50000000000) {
                    setCompanySize('large');
                }
                // Medium: Between ₦50M and ₦50B
                else {
                    setCompanySize('medium');
                }
            }
        }
    }, [income, taxMode]);

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

        if (taxMode === 'personal') {
            // Personal tax calculation
            const reliefs: TaxReliefs = {
                pension: parseNumber(pension),
                nhf: parseNumber(nhf),
                nhis: parseNumber(nhis),
                lifeInsurance: parseNumber(lifeInsurance),
                rentPaid: parseNumber(rentPaid),
                customDeductions: customDeductions,
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
            setBusinessTaxBreakdown(null);
        } else {
            // Business tax calculation
            const businessReliefs: BusinessTaxReliefs = {
                pension: parseNumber(pension),
                nhf: parseNumber(nhf),
                nhis: parseNumber(nhis),
                rentPaid: parseNumber(rentPaid),
                employmentRelief: parseNumber(employmentRelief),
                compensationRelief: parseNumber(compensationRelief),
                customDeductions: customDeductions,
            };

            const result = calculateBusinessTax(
                incomeValue,
                companySize,
                businessType,
                businessReliefs
            );

            setBusinessTaxBreakdown(result);
            setTaxBreakdown(null);
        }

        setShowResults(true);
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            if (taxMode === 'personal' && taxBreakdown) {
                const optimisticData = {
                    grossIncome: taxBreakdown.grossIncome,
                    incomeType,
                    taxMode: 'personal' as const,
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

                addCalculation(optimisticData);
                Alert.alert('Success', editMode ? 'Calculation updated successfully' : 'Calculation saved to My Taxes');
            } else if (taxMode === 'business' && businessTaxBreakdown) {
                const optimisticData = {
                    grossIncome: businessTaxBreakdown.grossIncome,
                    taxMode: 'business' as const,
                    companySize: businessTaxBreakdown.companySize,
                    businessType: businessTaxBreakdown.businessType,
                    pensionRelief: businessTaxBreakdown.pensionRelief,
                    nhfRelief: businessTaxBreakdown.nhfRelief,
                    nhisRelief: businessTaxBreakdown.nhisRelief,
                    rentRelief: businessTaxBreakdown.rentRelief,
                    taxableIncome: businessTaxBreakdown.taxableIncome,
                    companyIncomeTax: businessTaxBreakdown.companyIncomeTax,
                    developmentLevy: businessTaxBreakdown.developmentLevy,
                    totalTax: businessTaxBreakdown.totalTax,
                    netIncome: businessTaxBreakdown.netIncome,
                    effectiveTaxRate: businessTaxBreakdown.effectiveTaxRate,
                    ...(editMode ? { _id: editingId } : {})
                };

                addCalculation(optimisticData);
                Alert.alert('Success', editMode ? 'Calculation updated successfully' : 'Calculation saved to My Taxes');
            }
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
        setEmploymentRelief('');
        setCompensationRelief('');
        setCustomDeductions([]);
        setTaxBreakdown(null);
        setBusinessTaxBreakdown(null);
        setShowResults(false);
        setEditMode(false);
        setEditingId(null);
        router.setParams({ editMode: '', calculationId: '', reset: '' }); // Clear params
    };

    // Custom deduction helpers
    const addCustomDeduction = () => {
        const newDeduction: CustomDeduction = {
            id: Date.now().toString(),
            name: '',
            amount: 0,
            isTaxable: false,
        };
        setCustomDeductions([...customDeductions, newDeduction]);
    };

    const updateCustomDeduction = (id: string, field: keyof CustomDeduction, value: any) => {
        setCustomDeductions(customDeductions.map(d =>
            d.id === id ? { ...d, [field]: value } : d
        ));
    };

    const removeCustomDeduction = (id: string) => {
        setCustomDeductions(customDeductions.filter(d => d.id !== id));
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
        customDeductionCard: {
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        customDeductionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        customDeductionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
        },
        customDeductionInput: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 12,
            fontSize: 14,
            color: colors.text,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            gap: 6,
        },
        addButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
        },
        warningBox: {
            backgroundColor: colors.warning + '20',
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            flexDirection: 'row',
            gap: 8,
        },
        warningText: {
            flex: 1,
            fontSize: 12,
            color: colors.text,
            lineHeight: 18,
        },
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
        },
        switchLabel: {
            fontSize: 13,
            color: colors.text,
            flex: 1,
        },
    });


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tax Calculator</Text>
                <Text style={styles.headerSubtitle}>
                    Calculate {taxMode === 'personal' ? 'your' : 'business'} tax based on 2026 Nigeria Tax Act
                </Text>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content}>
                    <TaxModeToggle />
                    {taxMode === 'personal' ? (
                        <>
                            {/* Personal Income Input Card */}
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

                            {/* Personal Tax Reliefs Card */}
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
                                                thumbColor={autoCalculateReliefs ? '#FFFFFF' : colors.bg}
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

                                        {/* Custom Deductions */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Custom Deductions / Taxable Items</Text>

                                            {customDeductions.map((deduction) => (
                                                <View key={deduction.id} style={styles.customDeductionCard}>
                                                    <View style={styles.customDeductionHeader}>
                                                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                                                            Item
                                                        </Text>
                                                        <TouchableOpacity
                                                            onPress={() => removeCustomDeduction(deduction.id)}
                                                        >
                                                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                                        </TouchableOpacity>
                                                    </View>

                                                    <TextInput
                                                        style={styles.customDeductionInput}
                                                        placeholder="Item name"
                                                        placeholderTextColor={colors.textMuted}
                                                        value={deduction.name}
                                                        onChangeText={(text) => updateCustomDeduction(deduction.id, 'name', text)}
                                                    />

                                                    <View style={styles.customDeductionRow}>
                                                        <TextInput
                                                            style={[styles.customDeductionInput, { flex: 1 }]}
                                                            placeholder="Amount"
                                                            placeholderTextColor={colors.textMuted}
                                                            value={deduction.amount > 0 ? formatNumber(deduction.amount.toString()) : ''}
                                                            onChangeText={(text) => updateCustomDeduction(deduction.id, 'amount', parseNumber(text))}
                                                            keyboardType="numeric"
                                                        />
                                                    </View>

                                                    <View style={styles.switchRow}>
                                                        <Text style={styles.switchLabel}>
                                                            This item is taxable (adds to taxable income)
                                                        </Text>
                                                        <Switch
                                                            value={deduction.isTaxable}
                                                            onValueChange={(value) => updateCustomDeduction(deduction.id, 'isTaxable', value)}
                                                            trackColor={{ false: colors.border, true: colors.primary }}
                                                            thumbColor={deduction.isTaxable ? '#FFFFFF' : colors.bg}
                                                        />
                                                    </View>
                                                </View>
                                            ))}

                                            <TouchableOpacity
                                                style={styles.addButton}
                                                onPress={addCustomDeduction}
                                            >
                                                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                                <Text style={styles.addButtonText}>Add Custom Item</Text>
                                            </TouchableOpacity>

                                            <View style={styles.warningBox}>
                                                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                                                <Text style={styles.warningText}>
                                                    Not sure if an item is taxable? Visit the Education tab to learn about taxable vs non-taxable items under the 2026 Tax Act.
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    ) : (
                        <BusinessCalculatorForm
                            colors={colors}
                            income={income}
                            setIncome={setIncome}
                            companySize={companySize}
                            setCompanySize={setCompanySize}
                            businessType={businessType}
                            setBusinessType={setBusinessType}
                            pension={pension}
                            setPension={setPension}
                            nhf={nhf}
                            setNhf={setNhf}
                            nhis={nhis}
                            setNhis={setNhis}
                            rentPaid={rentPaid}
                            setRentPaid={setRentPaid}
                            employmentRelief={employmentRelief}
                            setEmploymentRelief={setEmploymentRelief}
                            compensationRelief={compensationRelief}
                            setCompensationRelief={setCompensationRelief}
                            customDeductions={customDeductions}
                            addCustomDeduction={addCustomDeduction}
                            updateCustomDeduction={updateCustomDeduction}
                            removeCustomDeduction={removeCustomDeduction}
                            isReliefsExpanded={isReliefsExpanded}
                            setIsReliefsExpanded={setIsReliefsExpanded}
                        />
                    )}

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
                            {taxBreakdown.customDeductions && taxBreakdown.customDeductions.length > 0 && (
                                <>
                                    <Text style={[styles.breakdownLabel, { marginTop: 12, marginBottom: 8 }]}>
                                        Custom Items:
                                    </Text>
                                    {taxBreakdown.customDeductions.map((item, index) => (
                                        <View key={index} style={[styles.breakdownRow, { paddingLeft: 12 }]}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.breakdownLabel}>
                                                    {item.name || `Item ${index + 1}`}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: colors.textMuted }}>
                                                    {item.isTaxable ? '(Taxable - adds to income)' : '(Deduction)'}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.breakdownValue,
                                                { color: item.isTaxable ? colors.danger : colors.success }
                                            ]}>
                                                {item.isTaxable ? '+' : '-'}{formatCurrency(item.amount)}
                                            </Text>
                                        </View>
                                    ))}
                                    {taxBreakdown.customDeductionsTotal > 0 && (
                                        <View style={[styles.breakdownRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
                                            <Text style={styles.breakdownLabel}>Total Custom Deductions</Text>
                                            <Text style={styles.breakdownValue}>
                                                {formatCurrency(taxBreakdown.customDeductionsTotal)}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}

                            <View style={styles.divider} />

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

                    {/* Business Tax Results */}
                    {showResults && businessTaxBreakdown && (
                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultTitle}>Net Business Income</Text>
                                <Text style={styles.resultAmount}>
                                    {formatCurrency(businessTaxBreakdown.netIncome)}
                                </Text>
                                <Text style={styles.resultSubtitle}>
                                    After tax deduction • {businessTaxBreakdown.effectiveTaxRate.toFixed(2)}% effective rate
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

                            {/* Company Information */}
                            <Text style={styles.cardTitle}>Company Information</Text>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Company Size</Text>
                                <Text style={styles.breakdownValue}>
                                    {businessTaxBreakdown.companySize.charAt(0).toUpperCase() + businessTaxBreakdown.companySize.slice(1)}
                                </Text>
                            </View>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Business Type</Text>
                                <Text style={styles.breakdownValue}>
                                    {businessTaxBreakdown.businessType.charAt(0).toUpperCase() + businessTaxBreakdown.businessType.slice(1)}
                                </Text>
                            </View>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Annual Turnover</Text>
                                <Text style={styles.breakdownValue}>
                                    {formatCurrency(businessTaxBreakdown.grossIncome)}
                                </Text>
                            </View>

                            {/* Exemptions Applied */}
                            {(businessTaxBreakdown.isSmallCompanyExempt || businessTaxBreakdown.isStartupExempt || businessTaxBreakdown.isAgriculturalExempt) && (
                                <>
                                    <View style={styles.divider} />
                                    <Text style={styles.cardTitle}>Exemptions Applied</Text>
                                    {businessTaxBreakdown.isSmallCompanyExempt && (
                                        <View style={[styles.bracketCard, { backgroundColor: colors.success + '20' }]}>
                                            <Text style={[styles.bracketHeader, { color: colors.success }]}>
                                                ✓ Small Company Exemption
                                            </Text>
                                            <Text style={styles.bracketDetails}>
                                                0% CIT & Development Levy (turnover ≤₦50M, assets ≤₦250M)
                                            </Text>
                                        </View>
                                    )}
                                    {businessTaxBreakdown.isStartupExempt && (
                                        <View style={[styles.bracketCard, { backgroundColor: colors.success + '20' }]}>
                                            <Text style={[styles.bracketHeader, { color: colors.success }]}>
                                                ✓ Startup Exemption
                                            </Text>
                                            <Text style={styles.bracketDetails}>
                                                Eligible startups are exempt from CIT
                                            </Text>
                                        </View>
                                    )}
                                    {businessTaxBreakdown.isAgriculturalExempt && (
                                        <View style={[styles.bracketCard, { backgroundColor: colors.success + '20' }]}>
                                            <Text style={[styles.bracketHeader, { color: colors.success }]}>
                                                ✓ Agricultural Tax Holiday
                                            </Text>
                                            <Text style={styles.bracketDetails}>
                                                5-year tax holiday for agricultural businesses
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}

                            <View style={styles.divider} />

                            {/* Reliefs & Deductions */}
                            <Text style={styles.cardTitle}>Reliefs & Deductions</Text>
                            {businessTaxBreakdown.pensionRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>Pension Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(businessTaxBreakdown.pensionRelief)}
                                    </Text>
                                </View>
                            )}
                            {businessTaxBreakdown.nhfRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>NHF Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(businessTaxBreakdown.nhfRelief)}
                                    </Text>
                                </View>
                            )}
                            {businessTaxBreakdown.nhisRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>NHIS Relief</Text>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(businessTaxBreakdown.nhisRelief)}
                                    </Text>
                                </View>
                            )}
                            {businessTaxBreakdown.rentRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <View>
                                        <Text style={styles.breakdownLabel}>Rent Relief</Text>
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>(20% of rent, max ₦500,000)</Text>
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(businessTaxBreakdown.rentRelief)}
                                    </Text>
                                </View>
                            )}
                            {businessTaxBreakdown.employmentRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <View>
                                        <Text style={styles.breakdownLabel}>Employment Relief</Text>
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>(50% of new hire salaries)</Text>
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(businessTaxBreakdown.employmentRelief)}
                                    </Text>
                                </View>
                            )}
                            {businessTaxBreakdown.compensationRelief > 0 && (
                                <View style={styles.breakdownRow}>
                                    <View>
                                        <Text style={styles.breakdownLabel}>Compensation Relief</Text>
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>(50% of salary increases)</Text>
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {formatCurrency(businessTaxBreakdown.compensationRelief)}
                                    </Text>
                                </View>
                            )}
                            {businessTaxBreakdown.customDeductions && businessTaxBreakdown.customDeductions.length > 0 && (
                                <>
                                    <Text style={[styles.breakdownLabel, { marginTop: 12, marginBottom: 8 }]}>
                                        Custom Items:
                                    </Text>
                                    {businessTaxBreakdown.customDeductions.map((item, index) => (
                                        <View key={index} style={[styles.breakdownRow, { paddingLeft: 12 }]}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.breakdownLabel}>
                                                    {item.name || `Item ${index + 1}`}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: colors.textMuted }}>
                                                    {item.isTaxable ? '(Taxable - adds to income)' : '(Deduction)'}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.breakdownValue,
                                                { color: item.isTaxable ? colors.danger : colors.success }
                                            ]}>
                                                {item.isTaxable ? '+' : '-'}{formatCurrency(item.amount)}
                                            </Text>
                                        </View>
                                    ))}
                                    {businessTaxBreakdown.customDeductionsTotal > 0 && (
                                        <View style={[styles.breakdownRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
                                            <Text style={styles.breakdownLabel}>Total Custom Deductions</Text>
                                            <Text style={styles.breakdownValue}>
                                                {formatCurrency(businessTaxBreakdown.customDeductionsTotal)}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Reliefs</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(businessTaxBreakdown.totalReliefs)}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            {/* Tax Calculation */}
                            <Text style={styles.cardTitle}>Tax Calculation</Text>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Taxable Income</Text>
                                <Text style={styles.breakdownValue}>
                                    {formatCurrency(businessTaxBreakdown.taxableIncome)}
                                </Text>
                            </View>

                            <View style={styles.bracketCard}>
                                <Text style={styles.bracketHeader}>Company Income Tax (CIT)</Text>
                                <Text style={styles.bracketDetails}>
                                    {businessTaxBreakdown.companyIncomeTax > 0
                                        ? `${formatCurrency(businessTaxBreakdown.taxableIncome)} × 30% = ${formatCurrency(businessTaxBreakdown.companyIncomeTax)}`
                                        : 'Exempt (0%)'}
                                </Text>
                            </View>

                            <View style={styles.bracketCard}>
                                <Text style={styles.bracketHeader}>Development Levy</Text>
                                <Text style={styles.bracketDetails}>
                                    {businessTaxBreakdown.developmentLevy > 0
                                        ? `${formatCurrency(businessTaxBreakdown.taxableIncome)} × 4% = ${formatCurrency(businessTaxBreakdown.developmentLevy)}`
                                        : 'Exempt (0%)'}
                                </Text>
                            </View>

                            {businessTaxBreakdown.minimumEffectiveTax > 0 && (
                                <View style={[styles.bracketCard, { backgroundColor: colors.warning + '20' }]}>
                                    <Text style={styles.bracketHeader}>Minimum Effective Tax (15%)</Text>
                                    <Text style={styles.bracketDetails}>
                                        Applied to very large companies (₦50B+ turnover)
                                    </Text>
                                </View>
                            )}

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Tax</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(businessTaxBreakdown.totalTax)}
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
