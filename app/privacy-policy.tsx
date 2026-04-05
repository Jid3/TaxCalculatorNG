import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';

// ─────────────────────────────────────────────────────────────────────────────
// Full policy URL (hosted on GitHub — update once you have a dedicated page)
// ─────────────────────────────────────────────────────────────────────────────
const PRIVACY_POLICY_URL = 'https://github.com/Jid3/TaxCalculatorNG/blob/main/PRIVACY_POLICY.md';
const Nigerian_Tax_Act_URL = 'https://www.nrs.gov.ng/uploads/NIGERIA_TAX_ACT_2025_ef6bb812a5.pdf'
// ─────────────────────────────────────────────────────────────────────────────

type SectionProps = {
  title: string;
  children: React.ReactNode;
  colors: any;
};

function PolicySection({ title, children, colors }: SectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type BodyTextProps = { children: React.ReactNode; colors: any; style?: any };
function BodyText({ children, colors, style }: BodyTextProps) {
  return (
    <Text style={[{ fontSize: 14, color: colors.textMuted, lineHeight: 22 }, style]}>
      {children}
    </Text>
  );
}

type TableRow = { col1: string; col2: string };
function PolicyTable({ rows, colors }: { rows: TableRow[]; colors: any }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
      {rows.map((row, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            backgroundColor: i % 2 === 0 ? colors.surface : colors.bg,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={{ flex: 1, fontSize: 13, color: colors.text, padding: 10, fontWeight: '600' }}>
            {row.col1}
          </Text>
          <Text style={{ flex: 1.5, fontSize: 13, color: colors.textMuted, padding: 10 }}>
            {row.col2}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.surface,
      padding: 10,
      paddingTop: 40,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: { marginRight: 12, padding: 4 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    content: { flex: 1, padding: 20 },
    metaCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaText: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
    linkCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
    bulletRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
    bullet: { fontSize: 14, color: colors.textMuted, marginRight: 6, marginTop: 4 },
    disclaimer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
  });

  const bullet = (text: string) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={{ flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 22 }}>{text}</Text>
    </View>
  );

  const link = (url: string, label?: string) => (
    <Text
      style={{ fontSize: 13, color: colors.primary, textDecorationLine: 'underline' }}
      onPress={() => handleOpenLink(url)}
    >
      {label || url}
    </Text>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Meta info */}
        <View style={styles.metaCard}>
          <Text style={styles.metaText}><Text style={{ color: colors.text, fontWeight: '600' }}>App:</Text> TaxNaija</Text>
          <Text style={styles.metaText}><Text style={{ color: colors.text, fontWeight: '600' }}>Effective Date:</Text> 1 April 2026</Text>
          <Text style={styles.metaText}><Text style={{ color: colors.text, fontWeight: '600' }}>Last Updated:</Text> 1 April 2026</Text>
          <Text style={styles.metaText}><Text style={{ color: colors.text, fontWeight: '600' }}>Developer:</Text> Jide Dev</Text>
        </View>

        {/* Full text link */}
        <TouchableOpacity style={styles.linkCard} onPress={() => handleOpenLink(PRIVACY_POLICY_URL)}>
          <Ionicons name="globe-outline" size={22} color={colors.primary} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>
              View full policy on GitHub
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
              {PRIVACY_POLICY_URL}
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* 1. Introduction */}
        <PolicySection title="1. Introduction" colors={colors}>
          <BodyText colors={colors}>
            Welcome to TaxNaija, a Nigerian personal and business tax calculator that helps individuals
            and businesses estimate their tax obligations under the 2026 Nigeria Tax Act.{'\n\n'}
            We are committed to protecting your privacy. This policy explains what information is
            collected, how it is stored, and how it is used. By using TaxNaija, you agree to the
            practices described here.{'\n\n'}
            ## Disclaimer {'\n\n'}
            TaxNaija: The Nigerian Tax Calculator is not a product or affiliated with the Nigerian Government. All information and calculations within the app are sourced from the publicly available Nigerian Tax Act, 2025 {Nigerian_Tax_Act_URL}. 
Users are advised to consult a certified legal or financial adviser before making any financial decision. This app is just a tool to quickly calculate and keep track of your taxable income. 
          </BodyText>
        </PolicySection>

        {/* 2. Information We Collect */}
        <PolicySection title="2. Information We Collect" colors={colors}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
            2.1 Financial Data You Enter
          </Text>
          <BodyText colors={colors} style={{ marginBottom: 8 }}>
            TaxNaija is an offline-first application. All financial data is processed entirely on
            your device and never transmitted to our servers.
          </BodyText>
          <PolicyTable colors={colors} rows={[
            { col1: 'Data', col2: 'Purpose' },
            { col1: 'Gross income (monthly / weekly / annual)', col2: 'Tax calculation' },
            { col1: 'Pension contributions', col2: 'Tax relief calculation' },
            { col1: 'NHF contributions', col2: 'Tax relief calculation' },
            { col1: 'NHIS contributions', col2: 'Tax relief calculation' },
            { col1: 'Life insurance premiums', col2: 'Tax relief calculation' },
            { col1: 'Annual rent paid', col2: 'Tax relief calculation' },
            { col1: 'Business turnover & type', col2: 'Business tax calculator' },
            { col1: 'Custom deductions', col2: 'Tax calculator' },
            { col1: 'Daily income & expense entries', col2: 'Calendar tracker' },
          ]} />

          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 }}>
            2.2 Security Credentials
          </Text>
          <BodyText colors={colors} style={{ marginBottom: 8 }}>
            If you enable App Lock, the following is stored securely only on your device:
          </BodyText>
          {bullet('A SHA-256 hashed version of your 6-digit PIN (your raw PIN is never stored)')}
          {bullet('Your biometric unlock preference (on/off flag only)')}
          {bullet('Your auto-lock timeout preference')}

          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 }}>
            2.3 Notification Preferences
          </Text>
          <BodyText colors={colors}>
            If you enable daily reminders, your preferred reminder times are stored locally on your
            device. No notification content is transmitted to external servers.
          </BodyText>

          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 }}>
            2.4 Advertising (Google AdMob)
          </Text>
          <BodyText colors={colors} style={{ marginBottom: 8 }}>
            TaxNaija uses Google AdMob to display ads. AdMob may automatically collect:
          </BodyText>
          {bullet('Device identifiers (e.g., Advertising ID)')}
          {bullet('IP address')}
          {bullet('App usage data')}
          {bullet('General device / OS information')}
          <View style={{ marginTop: 8 }}>
            <BodyText colors={colors}>Google&apos;s Privacy Policy: </BodyText>
            {link('https://policies.google.com/privacy')}
          </View>
        </PolicySection>

        <View style={styles.divider} />

        {/* 3. How We Use Data */}
        <PolicySection title="3. How We Use Your Information" colors={colors}>
          <PolicyTable colors={colors} rows={[
            { col1: 'Purpose', col2: 'Legal Basis' },
            { col1: 'Tax calculations on-device', col2: 'Providing the service' },
            { col1: 'Storing calculation history', col2: 'Your explicit save action' },
            { col1: 'Sending daily reminders', col2: 'Your notification settings' },
            { col1: 'App Lock (PIN / biometrics)', col2: 'Your explicit security settings' },
            { col1: 'Displaying advertisements', col2: 'AdMob consent framework' },
          ]} />
          <BodyText colors={colors} style={{ marginTop: 12 }}>
            We do <Text style={{ fontWeight: '700', color: colors.text }}>not</Text> use your
            financial data for any purpose other than performing calculations locally on your device.
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 4. Data Storage */}
        <PolicySection title="4. Data Storage" colors={colors}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
            4.1 On-Device Storage
          </Text>
          <BodyText colors={colors} style={{ marginBottom: 8 }}>
            All financial data (calculations, calendar entries, history) is stored locally using
            AsyncStorage. This data:
          </BodyText>
          {bullet('Never leaves your device via our systems')}
          {bullet('Is permanently deleted when you uninstall the App')}

          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 }}>
            4.2 Secure Storage
          </Text>
          <BodyText colors={colors}>
            Your hashed PIN and biometric settings use hardware-backed secure storage — iOS Keychain
            via Expo SecureStore on iOS, and Android Keystore on Android.
          </BodyText>

          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 }}>
            4.3 Clipboard Protection
          </Text>
          <BodyText colors={colors}>
            As a security measure, the App automatically clears your clipboard whenever it moves to
            the background, preventing sensitive financial data from being accessible to other apps.
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 5. Data Sharing */}
        <PolicySection title="5. Data Sharing" colors={colors}>
          <BodyText colors={colors}>
            We do <Text style={{ fontWeight: '700', color: colors.text }}>not</Text> sell, rent,
            trade, or transfer your personal financial information to any third parties.{'\n\n'}
            The only third party that may receive limited technical data from your device is
            Google AdMob for the purpose of serving advertisements (see Section 2.4).
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 6. Permissions */}
        <PolicySection title="6. Permissions Requested" colors={colors}>
          <PolicyTable colors={colors} rows={[
            { col1: 'Permission', col2: 'Reason' },
            { col1: 'USE_BIOMETRIC / USE_FINGERPRINT', col2: 'Fingerprint / Face ID unlock' },
            { col1: 'Face ID (iOS)', col2: 'Face ID unlock' },
            { col1: 'POST_NOTIFICATIONS (Android 13+)', col2: 'Daily tax reminder notifications (optional)' },
          ]} />
          <BodyText colors={colors} style={{ marginTop: 10 }}>
            The App does not request access to your contacts, camera, microphone, or location.
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 7. Children */}
        <PolicySection title="7. Children's Privacy" colors={colors}>
          <BodyText colors={colors}>
            TaxNaija is not directed at children under the age of 13 (or 16 in the EU/UK). We do
            not knowingly collect personal information from children. If you believe a child has
            provided data through this App, please contact us.
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 8. Retention */}
        <PolicySection title="8. Data Retention" colors={colors}>
          {bullet('Financial data: retained until you delete entries within the app or uninstall it.')}
          {bullet('Security credentials: retained until you disable App Lock or uninstall the App.')}
          {bullet('Notification preferences: retained until removed in Settings or the App is uninstalled.')}
        </PolicySection>

        <View style={styles.divider} />

        {/* 9. Your Rights */}
        <PolicySection title="9. Your Rights" colors={colors}>
          <BodyText colors={colors} style={{ marginBottom: 8 }}>
            Depending on your jurisdiction, you may have the right to:
          </BodyText>
          {bullet('Access the data you have entered (viewable directly within the App)')}
          {bullet('Delete your data (clear history in the App or uninstall it)')}
          {bullet('Opt out of personalised advertising (see Section 2.4)')}
          {bullet('Withdraw consent for notifications (remove reminder times in Settings)')}
          <BodyText colors={colors} style={{ marginTop: 10 }}>
            Since all data is stored exclusively on your device, all data access and erasure
            requests can be fulfilled through App settings and device management.
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 10. Security */}
        <PolicySection title="10. Security" colors={colors}>
          {bullet('PIN hashing: Your 6-digit PIN is hashed with SHA-256 — your raw PIN is never stored.')}
          {bullet('Secure storage: Credentials use hardware-backed enclaves (Keychain / Keystore).')}
          {bullet('Auto-lock: The App locks after 1, 5, or 10 minutes of inactivity (configurable).')}
          {bullet('Clipboard clearing: The clipboard is wiped each time the App goes to the background.')}
          {bullet('No network transmission of your financial data by our application.')}
        </PolicySection>

        <View style={styles.divider} />

        {/* 11. Third-Party Services */}
        <PolicySection title="11. Third-Party Services" colors={colors}>
          <PolicyTable colors={colors} rows={[
            { col1: 'Service', col2: 'Purpose' },
            { col1: 'Google AdMob', col2: 'In-app advertising' },
            { col1: 'Expo (EAS)', col2: 'App build & update infrastructure' },
          ]} />
          <View style={{ marginTop: 10, gap: 4 }}>
            <BodyText colors={colors}>AdMob Privacy Policy: </BodyText>
            {link('https://policies.google.com/privacy')}
            <BodyText colors={colors} style={{ marginTop: 6 }}>Expo Privacy Policy: </BodyText>
            {link('https://expo.dev/privacy')}
          </View>
        </PolicySection>

        <View style={styles.divider} />

        {/* 12. Changes */}
        <PolicySection title="12. Changes to This Policy" colors={colors}>
          <BodyText colors={colors}>
            We may update this Privacy Policy from time to time. Changes will be reflected by an
            updated &quot;Last Updated&quot; date. Continued use of the App after changes constitutes
            acceptance of the revised policy.
          </BodyText>
        </PolicySection>

        <View style={styles.divider} />

        {/* 13. Contact */}
        <PolicySection title="13. Contact Us" colors={colors}>
          <BodyText colors={colors} style={{ marginBottom: 8 }}>
            For any questions regarding this Privacy Policy:
          </BodyText>
          {bullet('Developer: Jide Dev')}
          {bullet('Email: [your-email@example.com]')}
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>GitHub: </Text>
              {link('https://github.com/Jid3/TaxCalculatorNG', 'github.com/Jid3/TaxCalculatorNG')}
            </View>
          </View>
        </PolicySection>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 18, fontStyle: 'italic' }}>
            This policy was prepared based on the technical implementation of TaxNaija v1.8.0.
            It does not constitute legal advice. Consult a qualified legal professional to ensure
            compliance with all applicable laws in your jurisdiction.
          </Text>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}
