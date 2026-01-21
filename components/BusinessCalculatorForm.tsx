import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompanySize, BusinessType, CustomDeduction } from '@/types/taxTypes';
import { formatNumber, parseNumber } from '@/utils/taxCalculations';

interface BusinessCalculatorFormProps {
    colors: any;
    income: string;
    setIncome: (value: string) => void;
    incomeType: 'monthly' | 'annual' | 'weekly';
    setIncomeType: (value: 'monthly' | 'annual' | 'weekly') => void;
    companySize: CompanySize;
    setCompanySize: (value: CompanySize) => void;
    businessType: BusinessType;
    setBusinessType: (value: BusinessType) => void;
    pension: string;
    setPension: (value: string) => void;
    nhf: string;
    setNhf: (value: string) => void;
    nhis: string;
    setNhis: (value: string) => void;
    rentPaid: string;
    setRentPaid: (value: string) => void;
    employmentRelief: string;
    setEmploymentRelief: (value: string) => void;
    compensationRelief: string;
    setCompensationRelief: (value: string) => void;
    customDeductions: CustomDeduction[];
    addCustomDeduction: () => void;
    updateCustomDeduction: (id: string, field: keyof CustomDeduction, value: any) => void;
    removeCustomDeduction: (id: string) => void;
    isReliefsExpanded: boolean;
    setIsReliefsExpanded: (value: boolean) => void;
}

export default function BusinessCalculatorForm(props: BusinessCalculatorFormProps) {
    const {
        colors,
        incomeType,
        setIncomeType,
        businessType,
        setBusinessType,
        pension,
        setPension,
        nhf,
        setNhf,
        nhis,
        setNhis,
        rentPaid,
        setRentPaid,
        employmentRelief,
        setEmploymentRelief,
        compensationRelief,
        setCompensationRelief,
        customDeductions,
        addCustomDeduction,
        updateCustomDeduction,
        removeCustomDeduction,
        isReliefsExpanded,
        setIsReliefsExpanded,
    } = props;

    const styles = StyleSheet.create({
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
        selectorRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
        },
        selectorButton: {
            paddingVertical: 12,
            paddingHorizontal: 14,
            minWidth: 90,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        selectorButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        selectorButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        selectorButtonTextActive: {
            color: '#ffffff',
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
            flex: 1,
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
        <>
            {/* Income Input Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Business Information</Text>

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
                        {incomeType === 'monthly' ? 'Monthly Business Income / Turnover' : incomeType === 'weekly' ? 'Weekly Business Income / Turnover' : 'Annual Business Income / Turnover'} (₦)
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter amount"
                        placeholderTextColor={colors.textMuted}
                        value={props.income}
                        onChangeText={(text) => props.setIncome(formatNumber(text))}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company Size</Text>
                    <View style={styles.selectorRow}>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                props.companySize === 'small' && styles.selectorButtonActive,
                            ]}
                            onPress={() => props.setCompanySize('small')}
                        >
                            <Text
                                style={[
                                    styles.selectorButtonText,
                                    props.companySize === 'small' && styles.selectorButtonTextActive,
                                ]}
                            >
                                Small
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                props.companySize === 'medium' && styles.selectorButtonActive,
                            ]}
                            onPress={() => props.setCompanySize('medium')}
                        >
                            <Text
                                style={[
                                    styles.selectorButtonText,
                                    props.companySize === 'medium' && styles.selectorButtonTextActive,
                                ]}
                            >
                                Medium
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                props.companySize === 'large' && styles.selectorButtonActive,
                            ]}
                            onPress={() => props.setCompanySize('large')}
                        >
                            <Text
                                style={[
                                    styles.selectorButtonText,
                                    props.companySize === 'large' && styles.selectorButtonTextActive,
                                ]}
                            >
                                Large
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginTop: 4, gap: 2 }}>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                            Small: ≤₦50M turnover & ≤₦250M assets (0% tax)
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                            Medium: ₦50M-₦50B turnover (30% CIT + 4% levy)
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                            Large: ≥₦50B turnover (30% CIT + 4% levy + 15% min. ETR)
                        </Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Business Type</Text>
                    <View style={styles.selectorRow}>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                businessType === 'general' && styles.selectorButtonActive,
                            ]}
                            onPress={() => setBusinessType('general')}
                        >
                            <Text
                                style={[
                                    styles.selectorButtonText,
                                    businessType === 'general' && styles.selectorButtonTextActive,
                                ]}
                            >
                                General
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                businessType === 'startup' && styles.selectorButtonActive,
                            ]}
                            onPress={() => setBusinessType('startup')}
                        >
                            <Text
                                style={[
                                    styles.selectorButtonText,
                                    businessType === 'startup' && styles.selectorButtonTextActive,
                                ]}
                            >
                                Startup
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                businessType === 'agricultural' && styles.selectorButtonActive,
                            ]}
                            onPress={() => setBusinessType('agricultural')}
                        >
                            <Text
                                style={[
                                    styles.selectorButtonText,
                                    businessType === 'agricultural' && styles.selectorButtonTextActive,
                                ]}
                            >
                                Agricultural
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Tax Reliefs & Deductions Card */}
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
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Pension Contribution (₦)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter pension amount"
                                placeholderTextColor={colors.textMuted}
                                value={pension}
                                onChangeText={(text) => setPension(formatNumber(text))}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>National Housing Fund (NHF) (₦)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter NHF amount"
                                placeholderTextColor={colors.textMuted}
                                value={nhf}
                                onChangeText={(text) => setNhf(formatNumber(text))}
                                keyboardType="numeric"
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
                            <Text style={styles.label}>Annual Rent Paid (₦)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter annual rent (optional)"
                                placeholderTextColor={colors.textMuted}
                                value={rentPaid}
                                onChangeText={(text) => setRentPaid(formatNumber(text))}
                                keyboardType="numeric"
                            />
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                                Relief: 20% of rent, max ₦500,000
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Employment Relief (₦)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Salaries of new hires (optional)"
                                placeholderTextColor={colors.textMuted}
                                value={employmentRelief}
                                onChangeText={(text) => setEmploymentRelief(formatNumber(text))}
                                keyboardType="numeric"
                            />
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                                50% deduction for new employees retained 3+ years
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Compensation Relief (₦)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Salary increases/transport subsidies (optional)"
                                placeholderTextColor={colors.textMuted}
                                value={compensationRelief}
                                onChangeText={(text) => setCompensationRelief(formatNumber(text))}
                                keyboardType="numeric"
                            />
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                                50% additional deduction for low-income worker benefits
                            </Text>
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
    );
}
