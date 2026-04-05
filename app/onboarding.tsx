import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Animated,
    ScrollView,
    Alert,
    Platform,
    KeyboardAvoidingView,
    useWindowDimensions,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useOnboarding, OnboardingProfile } from '@/contexts/OnboardingContext';
import { useTaxHistory } from '@/contexts/TaxHistoryContext';
import { useTaxMode } from '@/contexts/TaxModeContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { calculateTax } from '@/utils/taxCalculations';
import { formatCurrency, formatNumber, parseNumber } from '@/utils/taxCalculations';
import * as LocalAuthentication from 'expo-local-authentication';
const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const INCOME_TYPES = [
    { id: 'salaried', label: 'Salaried employee' },
    { id: 'freelancer', label: 'Freelancer' },
    { id: 'business', label: 'Business owner' },
    { id: 'multiple', label: 'Multiple sources' },
];

const TRIVIA_QUESTIONS = [
    {
        id: 1,
        question: "1. What is the minimum threshold of annual income to be exempt from Personal Income Tax?",
        options: [
            { id: 'a', text: 'a. ₦50,000' },
            { id: 'b', text: 'b. ₦200,000' },
            { id: 'c', text: 'c. ₦800,000' },
        ],
        answer: 'c'
    },
    {
        id: 2,
        question: "2. Which body is the new enforcers of the Nigerian Tax Act 2025?",
        options: [
            { id: 'a', text: 'a. Federal ministry of finance' },
            { id: 'b', text: 'b. Nigerian revenue service (NRS)' },
            { id: 'c', text: 'c. Central bank of Nigeria' },
        ],
        answer: 'b'
    },
    {
        id: 3,
        question: "3. As a small business owner making less than ₦20m per year, am I going to pay taxes?",
        options: [
            { id: 'a', text: 'a. Yes' },
            { id: 'b', text: 'b. No' },
            { id: 'c', text: 'c. I don\'t know' },
        ],
        answer: 'b'
    }
];

export default function OnboardingScreen() {
    const { colors, isDarkMode } = useTheme();
    const router = useRouter();
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { completeOnboarding } = useOnboarding();
    const { addCalculation } = useTaxHistory();
    const { setTaxMode } = useTaxMode();
    const {
        isBiometricAvailable,
        setPassword,
        setBiometricEnabled,
    } = useSecurity();

    // Current step (0-5)
    const [currentStep, setCurrentStep] = useState(0);

    // Animation for slide transitions
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Screen 2 — Profile Setup
    const [selectedIncomeType, setSelectedIncomeType] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [showStateSelector, setShowStateSelector] = useState(false);

    // Screen 3 — Quick Estimate
    const [grossIncome, setGrossIncome] = useState('');
    const [hasPension, setHasPension] = useState<'yes' | 'no' | 'notsure' | ''>('');
    const [estimatedTax, setEstimatedTax] = useState<number | null>(null);
    const [taxBreakdown, setTaxBreakdown] = useState<any>(null);

    // Screen 4 — Trivia
    const [triviaAnswers, setTriviaAnswers] = useState<Record<number, string>>({});
    const [triviaChecked, setTriviaChecked] = useState(false);
    const triviaScrollRef = useRef<ScrollView>(null);

    // Screen 5 — Security
    const [securityChoice, setSecurityChoice] = useState<'biometric' | 'pin' | ''>('');
    const [pinValue, setPinValue] = useState('');
    const [confirmPinValue, setConfirmPinValue] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [securitySetupDone, setSecuritySetupDone] = useState(false);

    // Screen 5 summary
    const [securityMethodLabel, setSecurityMethodLabel] = useState('None');

    // Animate to a step
    const animateToStep = (step: number) => {
        Animated.timing(slideAnim, {
            toValue: -step * SCREEN_WIDTH,
            duration: 350,
            useNativeDriver: true,
        }).start();
        setCurrentStep(step);
    };

    const goNext = () => {
        if (currentStep < 5) {
            animateToStep(currentStep + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 0) {
            animateToStep(currentStep - 1);
        }
    };

    // Calculate tax when income or pension changes
    useEffect(() => {
        const incomeValue = parseNumber(grossIncome);
        if (incomeValue > 0) {
            const pensionAmount = hasPension === 'yes' ? incomeValue * 0.08 : 0;
            const result = calculateTax(incomeValue, {
                pension: pensionAmount,
            });
            setEstimatedTax(result.totalTax);
            setTaxBreakdown(result);
        } else {
            setEstimatedTax(null);
            setTaxBreakdown(null);
        }
    }, [grossIncome, hasPension]);

    // Handle saving the quick estimate
    const handleSaveEstimate = async () => {
        if (taxBreakdown) {
            const incomeValue = parseNumber(grossIncome);
            const pensionAmount = hasPension === 'yes' ? incomeValue * 0.08 : 0;
            await addCalculation({
                grossIncome: taxBreakdown.grossIncome,
                incomeType: 'annual',
                taxMode: 'personal' as const,
                pensionRelief: taxBreakdown.pensionRelief,
                nhfRelief: 0,
                nhisRelief: 0,
                lifeInsuranceRelief: 0,
                rentRelief: 0,
                taxableIncome: taxBreakdown.taxableIncome,
                totalTax: taxBreakdown.totalTax,
                netIncome: taxBreakdown.netIncome,
            });
        }
    };

    // Handle security setup
    const handleSetupPin = async () => {
        if (pinValue.length !== 6 || !/^\d+$/.test(pinValue)) {
            Alert.alert('Error', 'PIN must be exactly 6 digits');
            return;
        }
        if (pinValue !== confirmPinValue) {
            Alert.alert('Error', 'PINs do not match');
            return;
        }

        try {
            await setPassword(pinValue);
            setSecuritySetupDone(true);
            setSecurityMethodLabel('PIN enabled');
        } catch (error) {
            Alert.alert('Error', 'Failed to save PIN');
        }
    };

    const handleSetupBiometric = async () => {
        try {
            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable Biometrics',
                fallbackLabel: 'Use Device Passcode',
            });

            if (authResult.success) {
                // Set a default PIN first (required by SecurityContext backward compatibility)
                // We use '000000' as a safe default so the context registers hasPassword=true
                await setPassword('000000');
                await setBiometricEnabled(true);
                setSecuritySetupDone(true);
                setSecurityMethodLabel('Fingerprint / Face ID enabled');
            } else {
                Alert.alert('Setup Cancelled', 'Authentication is required to use biometrics.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to enable biometric authentication');
        }
    };

    // Handle completing onboarding
    const handleComplete = async () => {
        // Set tax mode based on income type
        if (selectedIncomeType === 'business') {
            setTaxMode('business');
        } else {
            setTaxMode('personal');
        }

        // Save the estimate if there is one
        if (taxBreakdown) {
            await handleSaveEstimate();
        }

        const profile: OnboardingProfile = {
            incomeType: selectedIncomeType || 'salaried',
            state: selectedState || 'Lagos',
            securityMethod: securitySetupDone ? (securityChoice || 'none') : 'none',
        };

        await completeOnboarding(profile);
        router.replace('/(tabs)');
    };

    // Handle Trivia logic
    const handleTriviaAnswer = (questionId: number, answerId: string) => {
        if (!triviaChecked) {
            setTriviaAnswers(prev => ({ ...prev, [questionId]: answerId }));
        }
    };

    const handleCheckTrivia = () => {
        setTriviaChecked(true);
        setTimeout(() => {
            triviaScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const getTriviaScore = () => {
        let score = 0;
        TRIVIA_QUESTIONS.forEach(q => {
            if (triviaAnswers[q.id] === q.answer) score++;
        });
        return score;
    };

    // Get income type label
    const getIncomeTypeLabel = () => {
        const found = INCOME_TYPES.find(t => t.id === selectedIncomeType);
        return found ? found.label : 'Not set';
    };

    // ==================== STYLES ====================
    const summaryBg = isDarkMode ? '#1B3A1B' : '#E8F5E9';
    const summaryBorder = isDarkMode ? '#2E5A2E' : '#C8E6C9';

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        slidesContainer: {
            flexDirection: 'row',
            width: SCREEN_WIDTH * 6,
            flex: 1,
        },
        slide: {
            width: SCREEN_WIDTH,
            flex: 1,
        },
        slideInner: {
            flex: 1,
        },

        // Header with TaxNaija branding
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: Math.max(insets.top, 40),
            paddingHorizontal: 20,
            paddingBottom: 12,
        },
        headerBrand: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
        },
        headerBrandAccent: {
            color: colors.primary,
            fontWeight: '800',
        },

        // Progress dots
        dotsContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 12,
            gap: 8,
        },
        dot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        dotActive: {
            backgroundColor: colors.primary,
        },
        dotInactive: {
            backgroundColor: colors.border,
        },

        // Welcome screen
        welcomeContainer: {
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: Math.max(insets.top + 20, 50),
        },
        logoCircle: {
            width: 80,
            height: 80,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
        },
        welcomeBrand: { fontSize: 36, fontWeight: '900', color: colors.text, marginBottom: 4, textAlign: 'center' },
        welcomeBrandAccent: {
            color: colors.primary,
        },
        welcomeTagline: { fontSize: 18, color: colors.textMuted, marginBottom: 40, textAlign: 'center' },
        welcomeHeading: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 8, textAlign: 'center' },
        welcomeSubtitle: { fontSize: 18, color: colors.textMuted, lineHeight: 26, marginBottom: 36, textAlign: 'center' },
        featureRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 24,
            gap: 14,
        },
        featureIconCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + '18',
            justifyContent: 'center',
            alignItems: 'center',
        },
        featureTextContainer: {
            flex: 1,
        },
        featureTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 2,
        },
        featureDesc: {
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 18,
        },

        // Continue button (bottom)
        bottomButtonContainer: {
            paddingHorizontal: 28,
            paddingBottom: Math.max(insets.bottom + 10, 20),
            paddingTop: 16,
        },
        continueButton: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center', alignSelf: 'center', minWidth: 160 },
        
        navRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 28,
            paddingBottom: Math.max(insets.bottom + 10, 20),
            paddingTop: 16,
        },
        backButtonNav: {
            padding: 10,
        },
        skipButtonNav: {
            padding: 10,
        },
        continueButtonDisabled: {
            backgroundColor: colors.textMuted + '80',
        },
        continueButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

        // Skip button (bottom right)
        skipButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 28,
            paddingBottom: 4,
        },
        skipButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 4,
            gap: 4,
        },
        skipText: {
            fontSize: 14,
            color: colors.textMuted,
            fontWeight: '500',
        },

        // Profile Setup
        profileScrollContent: {
            paddingHorizontal: 28,
            paddingBottom: 20,
        },
        sectionTitle: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: 8, marginTop: 8, textAlign: 'center' },
        sectionSubtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 32, lineHeight: 24, textAlign: 'center' },
        chipsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 28,
        },
        chip: {
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        chipSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '15',
        },
        chipText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        chipTextSelected: {
            color: colors.primary,
        },
        fieldLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 10,
        },
        fieldHelper: {
            fontSize: 12,
            color: colors.textMuted,
            fontStyle: 'italic',
            marginTop: 6,
            marginBottom: 20,
        },
        stateSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.primary + '15',
            borderRadius: 24,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderWidth: 1.5,
            borderColor: colors.primary,
            alignSelf: 'flex-start',
        },
        stateSelectorText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
            marginRight: 6,
        },
        stateDropdown: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: 250,
            marginTop: 8,
            marginBottom: 12,
        },
        stateItem: {
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        stateItemSelected: {
            backgroundColor: colors.primary + '12',
        },
        stateItemText: {
            fontSize: 14,
            color: colors.text,
        },
        stateItemTextSelected: {
            color: colors.primary,
            fontWeight: '600',
        },

        // Quick Estimate
        estimateScrollContent: {
            paddingHorizontal: 28,
            paddingBottom: 20,
        },
        inputGroup: {
            marginBottom: 20,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 10,
        },
        input: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: colors.text,
        },
        pensionContainer: {
            flexDirection: 'row',
            gap: 10,
            marginBottom: 20,
        },
        pensionButton: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        pensionButtonSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '15',
        },
        pensionButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        pensionButtonTextSelected: {
            color: colors.primary,
        },
        resultCard: {
            backgroundColor: summaryBg,
            borderRadius: 16,
            padding: 20,
            marginTop: 12,
            borderWidth: 1,
            borderColor: summaryBorder,
            alignItems: 'center',
        },
        resultLabel: {
            fontSize: 13,
            color: colors.primary,
            fontWeight: '600',
            marginBottom: 6,
        },
        resultAmount: {
            fontSize: 32,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 4,
        },
        resultSubtitle: {
            fontSize: 12,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 18,
        },

        // Security
        securityScrollContent: {
            paddingHorizontal: 28,
            paddingBottom: 20,
        },
        securityCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1.5,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
        },
        securityCardSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '08',
        },
        securityIconCircle: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
        },
        securityCardContent: {
            flex: 1,
        },
        securityCardTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 2,
        },
        securityCardDesc: {
            fontSize: 12,
            color: colors.textMuted,
        },
        recommendedBadge: {
            backgroundColor: colors.primary + '20',
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 3,
            alignSelf: 'flex-start',
            marginTop: 4,
        },
        recommendedText: {
            fontSize: 11,
            fontWeight: '700',
            color: colors.primary,
        },
        pinInputContainer: {
            marginTop: 16,
            gap: 12,
        },
        pinInput: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
            letterSpacing: 8,
        },
        showPinRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        setupButton: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 8,
        },
        setupButtonText: {
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '700',
        },
        skipSecurityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingVertical: 18, backgroundColor: '#FF3B3015', borderRadius: 16 },
        skipSecurityText: { fontSize: 20, fontWeight: '800', color: '#FF3B30', marginLeft: 12 },
        successIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 12,
            paddingVertical: 10,
            backgroundColor: colors.primary + '15',
            borderRadius: 12,
        },
        successText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
        },

        // Trivia
        triviaScrollContent: {
            paddingHorizontal: 28,
            paddingBottom: 20,
        },
        questionContainer: {
            marginBottom: 24,
        },
        questionText: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
        },
        optionButton: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        optionButtonSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '15',
        },
        optionButtonCorrect: {
            borderColor: '#00C853',
            backgroundColor: '#00C85315',
        },
        optionButtonWrong: {
            borderColor: '#FF3B30',
            backgroundColor: '#FF3B3015',
        },
        optionText: {
            fontSize: 14,
            color: colors.text,
        },
        optionTextSelected: {
            color: colors.primary,
            fontWeight: '600',
        },
        triviaResultCard: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1.5,
            borderColor: colors.border,
            marginVertical: 12,
            alignItems: 'center',
        },
        triviaResultTitle: {
            fontSize: 16,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 4,
        },
        triviaResultText: {
            fontSize: 13,
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: 4,
            lineHeight: 18,
        },

        // All Done
        allDoneContainer: {
            flex: 1,
            paddingHorizontal: 28,
            alignItems: 'center',
            justifyContent: 'center',
        },
        checkCircle: {
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        allDoneTitle: {
            fontSize: 28,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 10,
        },
        allDoneSubtitle: {
            fontSize: 14,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
            paddingHorizontal: 10,
        },
        summaryCard: {
            width: '100%',
            backgroundColor: summaryBg,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: summaryBorder,
            marginBottom: 32,
        },
        summaryTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 14,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        summaryLabel: {
            fontSize: 13,
            color: colors.textMuted,
            fontWeight: '500',
        },
        summaryValue: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.text,
        },
        goButton: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center' },
        goButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
        disabledCard: {
            opacity: 0.5,
        },
        disabledText: {
            fontSize: 11,
            color: colors.textMuted,
            fontStyle: 'italic',
            marginTop: 4,
        },
    });

    // ==================== RENDER SCREENS ====================

    const renderWelcome = () => (
        <View style={styles.slide}>
            <View style={styles.slideInner}>
                <View style={styles.welcomeContainer}>
                    {/* Logo */}
                    <Image 
                        source={require('@/assets/images/iconTaxCalc.png')} 
                        style={styles.logoCircle}
                        resizeMode="cover"
                    />

                    {/* Branding */}
                    <Text style={styles.welcomeBrand}>
                        Welcome to Tax<Text style={styles.welcomeBrandAccent}>Naija!</Text> 😊
                    </Text>
                    <Text style={styles.welcomeTagline}>
                        Nigeria&apos;s 2026 tax laws, simplified
                    </Text>

                    {/* Heading */}
                    <Text style={styles.welcomeHeading}>
                        Know exactly what you owe
                    </Text>
                    <Text style={styles.welcomeSubtitle}>
                        Instant, accurate tax calculations for employees, freelancers, and business owners — all offline
                    </Text>

                    {/* Features */}
                    <View style={styles.featureRow}>
                        <View style={styles.featureIconCircle}>
                            <Ionicons name="calculator-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>PAYE & business tax</Text>
                            <Text style={styles.featureDesc}>Covers all major tax types</Text>
                        </View>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIconCircle}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Tax calendar</Text>
                            <Text style={styles.featureDesc}>Never miss a deadline</Text>
                        </View>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIconCircle}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>100% offline & private</Text>
                            <Text style={styles.featureDesc}>Your data never leaves your phone</Text>
                        </View>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIconCircle}>
                            <Ionicons name="book-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Get to know your tax laws</Text>
                            <Text style={styles.featureDesc}>Learn about Nigerian tax rules</Text>
                        </View>
                    </View>
                </View>

                {/* Continue */}
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity style={styles.continueButton} onPress={goNext}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderProfileSetup = () => (
        <View style={styles.slide}>
            <View style={styles.slideInner}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerBrand}>
                        Tax<Text style={styles.headerBrandAccent}>Naija</Text>
                    </Text>
                </View>

                {/* Progress dots */}
                <View style={styles.dotsContainer}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.profileScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sectionTitle}>How do you earn your income?</Text>
                        <Text style={styles.sectionSubtitle}>
                            This helps us show the right tax calculator for you. You can change it anytime.
                        </Text>

                        {/* Income type chips */}
                        <View style={styles.chipsContainer}>
                            {INCOME_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.chip,
                                        selectedIncomeType === type.id && styles.chipSelected,
                                    ]}
                                    onPress={() => setSelectedIncomeType(type.id)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            selectedIncomeType === type.id && styles.chipTextSelected,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* State selector */}
                        <Text style={styles.fieldLabel}>What state do you work in?</Text>
                        <TouchableOpacity
                            style={styles.stateSelector}
                            onPress={() => setShowStateSelector(!showStateSelector)}
                        >
                            <Text style={styles.stateSelectorText}>
                                {selectedState || 'Select state'}
                            </Text>
                            <Ionicons
                                name={showStateSelector ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.fieldHelper}>
                            Used for state-level tax reliefs where applicable
                        </Text>

                        {showStateSelector && (
                            <ScrollView style={styles.stateDropdown} nestedScrollEnabled>
                                {NIGERIAN_STATES.map((state) => (
                                    <TouchableOpacity
                                        key={state}
                                        style={[
                                            styles.stateItem,
                                            selectedState === state && styles.stateItemSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedState(state);
                                            setShowStateSelector(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.stateItemText,
                                                selectedState === state && styles.stateItemTextSelected,
                                            ]}
                                        >
                                            {state}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom: Skip + Continue */}
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.backButtonNav} onPress={goBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.continueButton, !selectedIncomeType && styles.continueButtonDisabled]} 
                        onPress={goNext}
                        disabled={!selectedIncomeType}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.skipButtonNav} onPress={goNext}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderQuickEstimate = () => (
        <View style={styles.slide}>
            <View style={styles.slideInner}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerBrand}>
                        Tax<Text style={styles.headerBrandAccent}>Naija</Text>
                    </Text>
                </View>

                {/* Progress dots */}
                <View style={styles.dotsContainer}>
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.estimateScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sectionTitle}>Let&apos;s estimate your tax</Text>
                        <Text style={styles.sectionSubtitle}>
                            Enter your details for an instant preview. Nothing is saved to any server.
                        </Text>

                        {/* Gross Income */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Annual gross income (₦)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="₦ 0"
                                placeholderTextColor={colors.textMuted}
                                value={grossIncome}
                                onChangeText={(text) => setGrossIncome(formatNumber(text))}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Pension question */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Do you have a pension (CRA)?</Text>
                            <View style={styles.pensionContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.pensionButton,
                                        hasPension === 'yes' && styles.pensionButtonSelected,
                                    ]}
                                    onPress={() => setHasPension('yes')}
                                >
                                    <Text
                                        style={[
                                            styles.pensionButtonText,
                                            hasPension === 'yes' && styles.pensionButtonTextSelected,
                                        ]}
                                    >
                                        Yes
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.pensionButton,
                                        hasPension === 'no' && styles.pensionButtonSelected,
                                    ]}
                                    onPress={() => setHasPension('no')}
                                >
                                    <Text
                                        style={[
                                            styles.pensionButtonText,
                                            hasPension === 'no' && styles.pensionButtonTextSelected,
                                        ]}
                                    >
                                        No
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.pensionButton,
                                    hasPension === 'notsure' && styles.pensionButtonSelected,
                                    { alignSelf: 'flex-start' },
                                ]}
                                onPress={() => setHasPension('notsure')}
                            >
                                <Text
                                    style={[
                                        styles.pensionButtonText,
                                        hasPension === 'notsure' && styles.pensionButtonTextSelected,
                                    ]}
                                >
                                    Not sure
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Result */}
                        {estimatedTax !== null && (
                            <View style={styles.resultCard}>
                                <Text style={styles.resultLabel}>Estimated annual PAYE tax</Text>
                                <Text style={styles.resultAmount}>
                                    {formatCurrency(estimatedTax)}
                                </Text>
                                <Text style={styles.resultSubtitle}>
                                    Based on 2026 PIT rates — tap to see full breakdown
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.fieldHelper, { textAlign: 'center', marginTop: 10 }]}>
                            Note: More deductibles can be added when you complete the app setup.
                        </Text>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom: Skip + Continue */}
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.backButtonNav} onPress={goBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.continueButton, (!grossIncome || !hasPension) && styles.continueButtonDisabled]} 
                        onPress={goNext}
                        disabled={!grossIncome || !hasPension}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.skipButtonNav} onPress={goNext}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderTrivia = () => {
        const score = getTriviaScore();
        const allCorrect = score === 3;
        
        return (
        <View style={styles.slide}>
            <View style={styles.slideInner}>
                <View style={styles.header}>
                    <Text style={styles.headerBrand}>
                        Tax<Text style={styles.headerBrandAccent}>Naija</Text>
                    </Text>
                </View>

                {/* Progress dots */}
                <View style={styles.dotsContainer}>
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        ref={triviaScrollRef}
                        contentContainerStyle={styles.triviaScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sectionTitle}>Test Your Tax Knowledge!</Text>
                        <Text style={styles.sectionSubtitle}>
                            Let&apos;s see how much you know about the new tax laws before setting up security.
                        </Text>

                        {TRIVIA_QUESTIONS.map(q => (
                            <View key={q.id} style={styles.questionContainer}>
                                <Text style={styles.questionText}>{q.question}</Text>
                                {q.options.map(opt => {
                                    const isSelected = triviaAnswers[q.id] === opt.id;
                                    const isCorrect = triviaChecked && opt.id === q.answer;
                                    const isWrongSelected = triviaChecked && isSelected && !isCorrect;
                                    
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[
                                                styles.optionButton,
                                                isSelected && !triviaChecked && styles.optionButtonSelected,
                                                isCorrect && styles.optionButtonCorrect,
                                                isWrongSelected && styles.optionButtonWrong,
                                            ]}
                                            onPress={() => handleTriviaAnswer(q.id, opt.id)}
                                            disabled={triviaChecked}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                isSelected && !triviaChecked && styles.optionTextSelected,
                                                isCorrect && { color: '#00C853', fontWeight: '600' },
                                                isWrongSelected && { color: '#FF3B30', fontWeight: '600' }
                                            ]}>
                                                {opt.text}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}

                        {triviaChecked && (
                            <View style={[
                                styles.triviaResultCard,
                                allCorrect ? { borderColor: '#00C853', backgroundColor: '#00C85310' } : {}
                            ]}>
                                <Text style={styles.triviaResultTitle}>
                                    {allCorrect ? 'Perfect Score! 🌟' : `You got ${score} out of 3`}
                                </Text>
                                <Text style={styles.triviaResultText}>
                                    {allCorrect 
                                        ? "You're a tax expert! Let's continue." 
                                        : "Don't worry! You can use the Education section of the app later to brush up your knowledge."}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom: Nav Row */}
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.backButtonNav} onPress={goBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    {!triviaChecked ? (
                        <TouchableOpacity 
                            style={[styles.continueButton, Object.keys(triviaAnswers).length < 3 && styles.continueButtonDisabled]} 
                            onPress={handleCheckTrivia} 
                            disabled={Object.keys(triviaAnswers).length < 3}
                        >
                            <Text style={styles.continueButtonText}>Check answers</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.continueButton} onPress={goNext}>
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={{width: 44, height: 44}} disabled={true} />
                </View>
            </View>
        </View>
        );
    };

    const renderSecurity = () => (
        <View style={styles.slide}>
            <View style={styles.slideInner}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerBrand}>
                        Tax<Text style={styles.headerBrandAccent}>Naija</Text>
                    </Text>
                </View>

                {/* Progress dots */}
                <View style={styles.dotsContainer}>
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotInactive]} />
                    <View style={[styles.dot, styles.dotActive]} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.securityScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sectionTitle}>Secure your financial data</Text>
                        <Text style={styles.sectionSubtitle}>
                            Your tax info is sensitive. Add a lock so only you can access TaxNaija.
                        </Text>

                        {/* Biometric option */}
                        <TouchableOpacity
                            style={[
                                styles.securityCard,
                                securityChoice === 'biometric' && styles.securityCardSelected,
                                !isBiometricAvailable && styles.disabledCard,
                            ]}
                            onPress={() => isBiometricAvailable && setSecurityChoice('biometric')}
                            disabled={!isBiometricAvailable}
                        >
                            <View style={styles.securityIconCircle}>
                                <Ionicons name="finger-print" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.securityCardContent}>
                                <Text style={styles.securityCardTitle}>Fingerprint / Face ID</Text>
                                <Text style={styles.securityCardDesc}>Fastest and most secure</Text>
                                {isBiometricAvailable ? (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedText}>Recommended</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.disabledText}>Not available on this device</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* PIN option */}
                        <TouchableOpacity
                            style={[
                                styles.securityCard,
                                securityChoice === 'pin' && styles.securityCardSelected,
                            ]}
                            onPress={() => setSecurityChoice('pin')}
                        >
                            <View style={styles.securityIconCircle}>
                                <Ionicons name="keypad-outline" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.securityCardContent}>
                                <Text style={styles.securityCardTitle}>6 digit PIN</Text>
                                <Text style={styles.securityCardDesc}>Manual lock with a PIN code</Text>
                            </View>
                        </TouchableOpacity>

                        {/* PIN input */}
                        {securityChoice === 'pin' && !securitySetupDone && (
                            <View style={styles.pinInputContainer}>
                                <TextInput
                                    style={styles.pinInput}
                                    placeholder="Enter 6-digit PIN"
                                    placeholderTextColor={colors.textMuted}
                                    value={pinValue}
                                    onChangeText={setPinValue}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    secureTextEntry={!showPin}
                                />
                                <TextInput
                                    style={styles.pinInput}
                                    placeholder="Confirm 6-digit PIN"
                                    placeholderTextColor={colors.textMuted}
                                    value={confirmPinValue}
                                    onChangeText={setConfirmPinValue}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    secureTextEntry={!showPin}
                                />
                                <View style={styles.showPinRow}>
                                    <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                                        <Text style={{ color: colors.primary, fontSize: 13 }}>
                                            {showPin ? 'Hide' : 'Show'} PIN
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.setupButton} onPress={handleSetupPin}>
                                    <Text style={styles.setupButtonText}>Set PIN</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Biometric setup */}
                        {securityChoice === 'biometric' && !securitySetupDone && (
                            <View style={{ marginTop: 16 }}>
                                <TouchableOpacity
                                    style={styles.setupButton}
                                    onPress={handleSetupBiometric}
                                >
                                    <Text style={styles.setupButtonText}>Enable fingerprint</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Success indicator */}
                        {securitySetupDone && (
                            <View style={styles.successIndicator}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                <Text style={styles.successText}>{securityMethodLabel} — all set!</Text>
                            </View>
                        )}

                        {/* Skip for now */}
                        {!securitySetupDone && (
                            <TouchableOpacity style={styles.skipSecurityRow} onPress={goNext}>
                                <Ionicons name="close-circle" size={36} color="#FF3B30" />
                                <Text style={styles.skipSecurityText}>Skip for now{'\n'}Not recommended</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom: Nav */}
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.backButtonNav} onPress={goBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.continueButton, !securitySetupDone && styles.continueButtonDisabled]} 
                        onPress={goNext}
                        disabled={!securitySetupDone}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width: 44, height: 44}} disabled={true} />
                </View>
            </View>
        </View>
    );

    const renderAllDone = () => (
        <View style={styles.slide}>
            <View style={styles.slideInner}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerBrand}>
                        Tax<Text style={styles.headerBrandAccent}>Naija</Text>
                    </Text>
                </View>

                <View style={styles.allDoneContainer}>
                    {/* Checkmark */}
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={48} color="#FFFFFF" />
                    </View>

                    <Text style={styles.allDoneTitle}>You&apos;re all set!</Text>
                    <Text style={styles.allDoneSubtitle}>
                        TaxNaija is ready. Your profile is saved locally and your data is protected.
                    </Text>



                    {/* Go to dashboard */}
                    <TouchableOpacity style={styles.goButton} onPress={handleComplete}>
                        <Text style={styles.goButtonText}>Go to dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // ==================== MAIN RENDER ====================
    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121812' : '#F4FCF4' }]}>
            <Animated.View
                style={[
                    styles.slidesContainer,
                    { transform: [{ translateX: slideAnim }] },
                ]}
            >
                {renderWelcome()}
                {renderProfileSetup()}
                {renderQuickEstimate()}
                {renderTrivia()}
                {renderSecurity()}
                {renderAllDone()}
            </Animated.View>
        </View>
    );
}
