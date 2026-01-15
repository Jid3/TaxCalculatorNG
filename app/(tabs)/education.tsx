import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';

export default function EducationScreen() {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual');
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const toggleItem = (item: string) => {
        setExpandedItem(expandedItem === item ? null : item);
    };

    const educationData = {
        individual: {
            taxable: [
                { title: "Employment Remuneration (Salary)", explanation: "This includes salaries, wages, fees, allowances, bonuses, and any other perquisites granted by an employer." },
                { title: "Periodic Bonuses", explanation: "Occasional payments made to employees, such as performance bonuses, holiday bonuses, or 13th-month pay." },
                { title: "Commissions & Incentives", explanation: "Payments made to employees based on sales targets or performance achievements. These are fully taxable as earned income." },
                { title: "Housing Allowance (above reliefs)", explanation: "Payment for housing. Any amount above the legally allowed tax relief is subject to tax under the Personal Income Tax Act." },
                { title: "Transport & Other Allowances", explanation: "Regular payments for commuting and other miscellaneous work-related costs are considered part of your gross taxable income." },
                { title: "Overtime Payments", explanation: "Additional pay for hours worked beyond the standard work week. All overtime earnings are added to your taxable gross income." },
                { title: "Benefits-in-Kind (BIK)", explanation: "Asset Use: If an employee uses an employer's asset, they are deemed to have earned a benefit equal to 5% of the asset's acquisition cost. \n\nAcommodation: Living accommodation provided by an employer is treated as income equal to its annual rental value, capped at 20% of the employee's annual gross income." }
            ],
            nonTaxable: [
                { title: "First ₦800,000 Annual Income", explanation: "Under the 2026 Tax Act, the first ₦800,000 you earn in a year is completely tax-free. This is the 'Tax-Free Threshold'." },
                { title: "Pension (8% of Basic salary)", explanation: "Your contribution to your retirement savings is deducted from your gross income before tax is calculated, reducing your tax burden." },
                { title: "National Housing Fund (NHF) Contribution (2.5%)", explanation: "Mandatory contribution towards the national housing scheme (2.5% of basic salary) is exempt from personal income tax." },
                { title: "Rent Relief (Lesser of ₦200k or 20% of rent)", explanation: "A new relief for 2026. You can deduct the lower of ₦200,000 or 20% of your annual rent from your taxable income." },
                { title: "National Health Insurance (NHIS)", explanation: "Contributions to the national health insurance scheme are tax-deductible to encourage healthcare coverage for employees." },
                { title: "Life Insurance Premiums", explanation: "Payments for life insurance policies are exempted from tax to promote financial security for families." },
                { title: "Capital Gains Exemptions", explanation: "Principal Private Residence: Disposal is exempt once in an individual's lifetime.\n\nPrivate Motor Vehicles: Up to two vehicles per year used for non-profit purposes are exempt.\n\nPersonal Chattels: Tangible movable property is exempt if the disposal consideration is below ₦5 million or three times the minimum wage.\n\nInjury Compensation: Sums up to ₦50 million for personal injury, libel, or slander are exempt.\n\nGifts: Assets acquired or disposed of as a gift (where no money is paid) do not incur chargeable gains tax." }
            ]
        },
        business: {
            taxable: [
                { title: "Net Business Profits", explanation: "The actual profit remaining after all legitimate business expenses have been deducted from your total revenue." },
                { title: "Directors' Fees & Sitting Allowances", explanation: "Payments made to board members or directors for their services and meeting attendance are subject to personal income tax." },
                { title: "Dividends (Subject to WHT)", explanation: "Profits distributed to shareholders. These are typically subject to Withholding Tax (WHT) at the point of payment." },
                { title: "Rental Income from Properties", explanation: "Revenue generated from leasing out business-owned buildings or land is considered taxable business income." },
                { title: "Interest Earned on Deposits", explanation: "Profit gained from money held in business bank accounts or fixed deposits is subject to corporate or personal income tax." }
            ],
            nonTaxable: [
                { title: "Wholly & Necessary Business Expenses", explanation: "Any costs incurred purely for the purpose of running the business (e.g., electricity, salaries, marketing) are tax-deductible." },
                { title: "Capital Allowances on Fixed Assets", explanation: "Deductions allowed for the wear and tear of business assets like machinery, vehicles, and equipment over time." },
                { title: "Small Business Exemption (Turnover < ₦25M)", explanation: "Businesses with an annual turnover of less than ₦25 million are exempted from Company Income Tax (CIT) under current laws." },
                { title: "Approved Donations to Public Funds", explanation: "Contributions made to recognized charitable organizations or public funds are tax-deductible up to certain limits." },
                { title: "Bad Debts Written Off", explanation: "Money owed to the business that has been officially declared uncollectible can be deducted from taxable income." }
            ]
        }
    };

    const Section = ({ title, items, isTaxable }: { title: string; items: { title: string; explanation: string }[]; isTaxable: boolean }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons
                    name={isTaxable ? "alert-circle" : "checkmark-circle"}
                    size={20}
                    color={isTaxable ? colors.danger : colors.success}
                    style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {items.map((item, index) => {
                    const isExpanded = expandedItem === item.title;
                    return (
                        <View key={index} style={[index !== items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() => toggleItem(item.title)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isTaxable ? "close" : "add"}
                                    size={18}
                                    color={isTaxable ? colors.danger : colors.success}
                                    style={{ marginRight: 12 }}
                                />
                                <Text style={[styles.listItemText, { color: colors.text, flex: 1 }]}>{item.title}</Text>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                            {isExpanded && (
                                <View style={[styles.explanationBox, { backgroundColor: colors.bg }]}>
                                    <Text style={[styles.explanationText, { color: colors.text }]}>
                                        {item.explanation}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}
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
        tabContainer: {
            flexDirection: 'row',
            padding: 16,
            gap: 12,
        },
        tab: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1,
        },
        tabText: {
            fontWeight: 'bold',
            fontSize: 14,
        },
        content: {
            padding: 16,
            paddingTop: 0,
        },
        section: {
            marginBottom: 24,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            marginLeft: 4,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        card: {
            borderRadius: 16,
            borderWidth: 1,
            overflow: 'hidden',
        },
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
        },
        listItemText: {
            fontSize: 14,
            fontWeight: '500',
        },
        explanationBox: {
            padding: 16,
            paddingTop: 8,
            paddingBottom: 20,
        },
        explanationText: {
            fontSize: 13,
            lineHeight: 18,
            opacity: 0.8,
        },
        infoBox: {
            padding: 16,
            borderRadius: 16,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        infoText: {
            flex: 1,
            fontSize: 14,
            lineHeight: 20,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tax Education</Text>
                <Text style={styles.headerSubtitle}>Understanding the 2025 Nigeria Tax Act</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        {
                            backgroundColor: activeTab === 'individual' ? colors.primary : colors.surface,
                            borderColor: activeTab === 'individual' ? colors.primary : colors.border
                        }
                    ]}
                    onPress={() => {
                        setActiveTab('individual');
                        setExpandedItem(null);
                    }}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'individual' ? '#fff' : colors.textMuted }]}>Personal Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        {
                            backgroundColor: activeTab === 'business' ? colors.primary : colors.surface,
                            borderColor: activeTab === 'business' ? colors.primary : colors.border
                        }
                    ]}
                    onPress={() => {
                        setActiveTab('business');
                        setExpandedItem(null);
                    }}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'business' ? '#fff' : colors.textMuted }]}>Business Owners</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        {activeTab === 'individual'
                            ? "Based on the Nigeria Tax Act, 2025, taxable and non-taxable items are categorized according to whether they apply to the profits of a business entity or the income of an individual."
                            : "For business owners, the Act focuses on profits, transactions, and specialized levies related to commercial operations. Small companies with turnover ≤₦50 million are taxed at 0%."}
                    </Text>
                </View>

                {activeTab === 'individual' ? (
                    <>
                        <Section
                            title="Taxable Items"
                            isTaxable={true}
                            items={educationData.individual.taxable}
                        />
                        <Section
                            title="Non-Taxable / Reliefs"
                            isTaxable={false}
                            items={educationData.individual.nonTaxable}
                        />
                    </>
                ) : (
                    <>
                        <Section
                            title="Taxable (Small/Med Business)"
                            isTaxable={true}
                            items={educationData.business.taxable}
                        />
                        <Section
                            title="Non-Taxable / Exemptions"
                            isTaxable={false}
                            items={educationData.business.nonTaxable}
                        />
                    </>
                )}

                {/* Disclaimer */}
                <View style={[styles.infoBox, { backgroundColor: colors.warning + '15', borderWidth: 1, borderColor: colors.warning + '30' }]}>
                    <Ionicons name="warning-outline" size={24} color={colors.warning} style={{ marginRight: 12 }} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        <Text style={{ fontWeight: 'bold' }}>Disclaimer: </Text>
                        The information provided in this education tab is for general guidance only and is subject to change. Tax laws and regulations may be updated or amended. Always consult a qualified legal or financial adviser for advice specific to your situation.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}
