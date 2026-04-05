import useTheme from '@/hooks/userTheme';
import {
    annualToMonthly,
    calculateTaxFromMonthly,
    formatCurrency,
    formatNumber,
} from '@/utils/taxCalculations';

import { AdBanner } from '@/components/AdBanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';

const CALENDAR_DATA_KEY = '@tax_calendar_data';

type DailyData = {
    income: string;
    expense: string;
};

type CalendarData = Record<string, DailyData>;

export default function CalendarScreen() {
    const { colors } = useTheme();

    // State for daily data stored in AsyncStorage
    const [data, setData] = useState<CalendarData>({});

    // Active month being viewed in the calendar (format: yyyy-mm)
    const [currentMonthStr, setCurrentMonthStr] = useState<string>(
        new Date().toISOString().split('T')[0].substring(0, 7)
    );

    // Modal State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [tempIncome, setTempIncome] = useState('');
    const [tempExpense, setTempExpense] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(CALENDAR_DATA_KEY);
            if (jsonValue != null) {
                setData(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.error('Failed to load calendar data', e);
        }
    };

    const saveData = async (newData: CalendarData) => {
        try {
            const jsonValue = JSON.stringify(newData);
            await AsyncStorage.setItem(CALENDAR_DATA_KEY, jsonValue);
            setData(newData);
        } catch (e) {
            console.error('Failed to save calendar data', e);
        }
    };

    const handleDayPress = (day: any) => {
        const dateStr = day.dateString;
        setSelectedDate(dateStr);
        if (data[dateStr]) {
            setTempIncome(data[dateStr].income);
            setTempExpense(data[dateStr].expense);
        } else {
            setTempIncome('');
            setTempExpense('');
        }
        setModalVisible(true);
    };

    const handleSaveDay = () => {
        if (selectedDate) {
            const incomeRaw = tempIncome.replace(/,/g, '') || '0';
            const expenseRaw = tempExpense.replace(/,/g, '') || '0';

            const newData = {
                ...data,
                [selectedDate]: {
                    income: incomeRaw,
                    expense: expenseRaw,
                },
            };

            // If both are 0 or empty, we can just remove the key to keep it clean (optional)
            if (incomeRaw === '0' && expenseRaw === '0') {
                delete newData[selectedDate];
            }

            saveData(newData);
            setModalVisible(false);
        }
    };

    // Process the marked dates for the calendar
    const markedDates = useMemo(() => {
        const marks: any = {};
        Object.keys(data).forEach((date) => {
            const hasIncome = parseFloat(data[date].income || '0') > 0;
            const hasExpense = parseFloat(data[date].expense || '0') > 0;

            if (hasIncome || hasExpense) {
                marks[date] = {
                    marked: true,
                    dotColor: hasIncome && hasExpense ? colors.primary : (hasIncome ? colors.success : colors.danger)
                };
            }
        });

        if (selectedDate) {
            marks[selectedDate] = {
                ...marks[selectedDate],
                selected: true,
                selectedColor: colors.primary,
            };
        }

        return marks;
    }, [data, selectedDate, colors]);

    // View summary calculation for the CURRENTLY displayed month
    const monthlySummary = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;

        Object.keys(data).forEach((dateStr) => {
            if (dateStr.startsWith(currentMonthStr)) {
                totalIncome += parseFloat(data[dateStr].income || '0');
                totalExpense += parseFloat(data[dateStr].expense || '0');
            }
        });

        const netIncome = Math.max(0, totalIncome - totalExpense);

        let taxBreakdown = null;
        if (netIncome > 0) {
            taxBreakdown = calculateTaxFromMonthly(netIncome);
        }

        return {
            totalIncome,
            totalExpense,
            netIncome,
            taxBreakdown,
        };
    }, [data, currentMonthStr]);

    const handleMonthChange = (month: any) => {
        setCurrentMonthStr(month.dateString.substring(0, 7));
    };


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        header: {
            backgroundColor: colors.surface,
            padding: 10,
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
        scrollContent: {
            paddingBottom: 20,
        },
        calendarCard: {
            margin: 15,
            borderRadius: 12,
            backgroundColor: colors.surface,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        summaryCard: {
            margin: 15,
            marginTop: 0,
            padding: 20,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        summaryTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
            textAlign: 'center',
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        summaryLabel: {
            fontSize: 16,
            color: colors.textMuted,
        },
        incomeValue: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.success,
        },
        expenseValue: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.danger,
        },
        netLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        netValue: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 15,
        },
        taxRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            alignItems: 'center',
        },
        taxLabelLarge: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary,
        },
        taxValueLarge: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
        },
        taxLabelSmall: {
            fontSize: 14,
            color: colors.textMuted,
        },
        taxValueSmall: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            width: '85%',
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 20,
            textAlign: 'center',
        },
        inputGroup: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: colors.bg,
        },
        currencySymbol: {
            fontSize: 16,
            color: colors.textMuted,
            marginRight: 8,
        },
        input: {
            flex: 1,
            height: 48,
            fontSize: 16,
            color: colors.text,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 20,
        },
        button: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            marginLeft: 10,
        },
        cancelButton: {
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cancelButtonText: {
            color: colors.text,
            fontWeight: '600',
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        saveButtonText: {
            color: '#fff',
            fontWeight: 'bold',
        },
        stickyAdContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.bg,
            paddingVertical: 4,
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calendar</Text>
                <Text style={styles.headerSubtitle}>Track daily income & expenses</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.calendarCard}>
                    <Calendar
                        current={currentMonthStr + '-01'}
                        onDayPress={handleDayPress}
                        onMonthChange={handleMonthChange}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: colors.surface,
                            calendarBackground: colors.surface,
                            textSectionTitleColor: colors.textMuted,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: colors.primary,
                            dayTextColor: colors.text,
                            textDisabledColor: colors.border,
                            dotColor: colors.primary,
                            selectedDotColor: '#ffffff',
                            arrowColor: colors.primary,
                            monthTextColor: colors.text,
                            indicatorColor: colors.primary,
                        }}
                    />
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Month Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={styles.incomeValue}>{formatCurrency(monthlySummary.totalIncome)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Expense</Text>
                        <Text style={styles.expenseValue}>{formatCurrency(monthlySummary.totalExpense)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.netLabel}>Net Income</Text>
                        <Text style={styles.netValue}>{formatCurrency(monthlySummary.netIncome)}</Text>
                    </View>

                    {monthlySummary.taxBreakdown && (
                        <>
                            <View style={styles.divider} />

                            <View style={styles.taxRow}>
                                <Text style={styles.taxLabelLarge}>Monthly Tax</Text>
                                <Text style={styles.taxValueLarge}>
                                    {formatCurrency(annualToMonthly(monthlySummary.taxBreakdown.totalTax))}
                                </Text>
                            </View>

                            <View style={styles.taxRow}>
                                <Text style={styles.taxLabelSmall}>Annualized Tax (Estimated)</Text>
                                <Text style={styles.taxValueSmall}>
                                    {formatCurrency(monthlySummary.taxBreakdown.totalTax)}
                                </Text>
                            </View>
                        </>
                    )}

                    {!monthlySummary.taxBreakdown && monthlySummary.netIncome > 0 && (
                        <View style={[styles.divider, { borderBottomWidth: 0 }]}>
                            <Text style={{ textAlign: 'center', color: colors.success, marginTop: 10, fontWeight: '500' }}>No tax applicable on this net income</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedDate}</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Income</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.currencySymbol}>₦</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textMuted}
                                    value={tempIncome ? formatNumber(tempIncome) : ''}
                                    onChangeText={(text) => setTempIncome(text.replace(/,/g, ''))}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Expense</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.currencySymbol}>₦</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textMuted}
                                    value={tempExpense ? formatNumber(tempExpense) : ''}
                                    onChangeText={(text) => setTempExpense(text.replace(/,/g, ''))}
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSaveDay}
                            >
                                <Text style={styles.saveButtonText}>Save Data</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>



            <View style={styles.stickyAdContainer}>
                <AdBanner
                    unitId="ca-app-pub-2599860932009835/7078490410"
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                />
            </View>
        </SafeAreaView>
    );
}
