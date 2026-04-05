const fs = require('fs');

const filepath = 'c:/Users/Jide/Documents/Project Tax 2.0/Taxcalculator/app/onboarding.tsx';
let text = fs.readFileSync(filepath, 'utf-8');

// 1. Imports
text = text.replace(
  'import { formatCurrency, formatNumber, parseNumber } from \'@/utils/taxCalculations\';',
  'import { formatCurrency, formatNumber, parseNumber } from \'@/utils/taxCalculations\';\nimport { LinearGradient } from \'expo-linear-gradient\';'
);

// 2. Main Render Background
text = text.replace(
  /<View style=\{styles\.container\}>\s*<Animated\.View/,
  '<LinearGradient colors={isDarkMode ? [\'#121212\', \'#182b18\', \'#0c1a0c\'] : [\'#FFFFFF\', \'#eafaf0\', \'#c2f0c2\']} style={styles.container}>\n            <Animated.View'
);
text = text.replace(
  /<\/Animated\.View>\s*<\/View>/,
  '</Animated.View>\n        </LinearGradient>'
);

// 3. Styles Layout tweaks
text = text.replace(
  /flexDirection: 'row',\s*alignItems: 'center',\s*justifyContent: 'center',\s*paddingTop: Math\.max\(insets\.top, 20\),/g,
  'flexDirection: \'row\',\n            alignItems: \'center\',\n            justifyContent: \'center\',\n            paddingTop: Math.max(insets.top, 40),'
);

text = text.replace(
  /welcomeBrand: \{[\s\S]*?\},/,
  'welcomeBrand: { fontSize: 36, fontWeight: \'900\', color: colors.text, marginBottom: 4, textAlign: \'center\' },'
);
text = text.replace(
  /welcomeTagline: \{[\s\S]*?\},/,
  'welcomeTagline: { fontSize: 18, color: colors.textMuted, marginBottom: 40, textAlign: \'center\' },'
);
text = text.replace(
  /welcomeHeading: \{[\s\S]*?\},/,
  'welcomeHeading: { fontSize: 32, fontWeight: \'900\', color: colors.text, marginBottom: 8, textAlign: \'center\' },'
);
text = text.replace(
  /welcomeSubtitle: \{[\s\S]*?\},/,
  'welcomeSubtitle: { fontSize: 18, color: colors.textMuted, lineHeight: 26, marginBottom: 36, textAlign: \'center\' },'
);

text = text.replace(
  /continueButton: \{[\s\S]*?\},/,
  'continueButton: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40, alignItems: \'center\', alignSelf: \'center\', minWidth: 160 },'
);
text = text.replace(
  /continueButtonText: \{[\s\S]*?\},/,
  'continueButtonText: { color: \'#FFFFFF\', fontSize: 18, fontWeight: \'800\' },'
);

const nav_styles = `
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
        continueButtonText:`;
text = text.replace('continueButtonText:', nav_styles);

text = text.replace(
  /sectionTitle: \{[\s\S]*?\},/,
  'sectionTitle: { fontSize: 28, fontWeight: \'900\', color: colors.text, marginBottom: 8, marginTop: 8, textAlign: \'center\' },'
);
text = text.replace(
  /sectionSubtitle: \{[\s\S]*?\},/,
  'sectionSubtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 32, lineHeight: 24, textAlign: \'center\' },'
);

const all_done_summary = `                    {/* Summary */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Your setup summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Type</Text>
                            <Text style={styles.summaryValue}>{getIncomeTypeLabel()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>State</Text>
                            <Text style={styles.summaryValue}>{selectedState || 'Not set'}</Text>
                        </View>
                        <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                            <Text style={styles.summaryLabel}>Security</Text>
                            <Text style={styles.summaryValue}>{securityMethodLabel}</Text>
                        </View>
                    </View>`;
text = text.replace(all_done_summary, '');

text = text.replace(
  /goButtonText: \{[\s\S]*?\},/,
  'goButtonText: { color: \'#FFFFFF\', fontSize: 20, fontWeight: \'800\' },'
);
text = text.replace(
  /goButton: \{[\s\S]*?\},/,
  'goButton: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 16, alignItems: \'center\' },'
);

text = text.replace(
  /skipSecurityText: \{[\s\S]*?\},/,
  'skipSecurityText: { fontSize: 20, fontWeight: \'800\', color: \'#FF3B30\', marginLeft: 12 },'
);
text = text.replace(
  /skipSecurityRow: \{[\s\S]*?\},/,
  'skipSecurityRow: { flexDirection: \'row\', alignItems: \'center\', justifyContent: \'center\', marginTop: 40, paddingVertical: 18, backgroundColor: \'#FF3B3015\', borderRadius: 16 },'
);
text = text.replace(
  '<Ionicons name="close-outline" size={18} color={colors.textMuted} />',
  '<Ionicons name="close-circle" size={36} color="#FF3B30" />'
);

const profile_nav_old = `                {/* Bottom: Skip + Continue */}
                <View style={styles.skipButtonContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={goNext}>
                        <Text style={styles.skipText}>Skip</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity style={styles.continueButton} onPress={goNext}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>`;

const profile_nav_new = `                {/* Bottom: Skip + Continue */}
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
                </View>`;
text = text.replace(profile_nav_old, profile_nav_new);

const qe_nav_old = profile_nav_old; // since it's identical text block
const qe_nav_new = `                {/* Bottom: Skip + Continue */}
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
                </View>`;
text = text.replace(qe_nav_old, qe_nav_new);

const trivia_nav_old = `                {/* Bottom: Skip + Continue/Check */}
                <View style={styles.skipButtonContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={goNext}>
                        <Text style={styles.skipText}>Skip</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomButtonContainer}>
                    {!triviaChecked ? (
                        <TouchableOpacity 
                            style={[styles.continueButton, Object.keys(triviaAnswers).length < 3 && { opacity: 0.5 }]} 
                            onPress={handleCheckTrivia} 
                            disabled={Object.keys(triviaAnswers).length < 3}
                        >
                            <Text style={styles.continueButtonText}>Check answers</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.continueButton} onPress={goNext}>
                            <Text style={styles.continueButtonText}>Continue to Security</Text>
                        </TouchableOpacity>
                    )}
                </View>`;

const trivia_nav_new = `                {/* Bottom: Nav Row */}
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
                </View>`;
text = text.replace(trivia_nav_old, trivia_nav_new);

const security_nav_old = `                {/* Bottom: Skip + Continue */}
                <View style={styles.skipButtonContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={goNext}>
                        <Text style={styles.skipText}>Skip</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity style={styles.continueButton} onPress={goNext}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>`;

const security_nav_new = `                {/* Bottom: Nav */}
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
                </View>`;
text = text.replace(security_nav_old, security_nav_new);

fs.writeFileSync(filepath, text, 'utf-8');
console.log('Script completed.');
