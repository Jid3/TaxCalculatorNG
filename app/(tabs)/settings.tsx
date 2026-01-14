import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurity } from '@/contexts/SecurityContext';

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const {
    hasPassword,
    isBiometricEnabled,
    isBiometricAvailable,
    setPassword,
    setBiometricEnabled,
    removeSecurity
  } = useSecurity();
  const router = useRouter();

  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [showPIN, setShowPIN] = useState(false);

  // For guest mode, displayUser is just the local user
  const displayUser = user || { name: 'Guest User', email: 'guest@example.com', imageUrl: null, userId: 'guest' };

  const handleLockToggle = async (value: boolean) => {
    if (value) {
      setIsPasswordModalVisible(true);
    } else {
      Alert.alert(
        'Disable App Lock',
        'Are you sure you want to disable PIN protection?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => await removeSecurity()
          }
        ]
      );
    }
  };

  const handleSavePIN = async () => {
    if (newPIN.length !== 6 || !/^\d+$/.test(newPIN)) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }
    if (newPIN !== confirmPIN) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      await setPassword(newPIN);
      setIsPasswordModalVisible(false);
      setNewPIN('');
      setConfirmPIN('');
      Alert.alert('Success', 'Security settings updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to save PIN');
    }
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
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      marginLeft: 16,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingCard: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
    aboutCard: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    aboutText: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      textAlign: 'center',
    },
    versionText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      width: '100%',
      borderRadius: 20,
      padding: 24,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 20,
    },
    modalInput: {
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      marginBottom: 12,
      fontSize: 16,
    },
    showPasswordButton: {
      alignSelf: 'flex-end',
      padding: 4,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 0.48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingCard}>
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingIcon}>
                <Ionicons
                  name={isDarkMode ? 'moon' : 'sunny'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? '#FFFFFF' : colors.bg}
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingCard}>
            {/* App Lock Toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Enable App Lock</Text>
                <Text style={styles.settingDescription}>
                  Require a 6-digit PIN to open the app
                </Text>
              </View>
              <Switch
                value={hasPassword}
                onValueChange={handleLockToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={hasPassword ? '#FFFFFF' : colors.bg}
              />
            </View>

            {/* Change Password */}
            {hasPassword && (
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setIsPasswordModalVisible(true)}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name="key" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Change PIN</Text>
                  <Text style={styles.settingDescription}>
                    Update your 6-digit app lock PIN
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            {/* Biometric Toggle */}
            {isBiometricAvailable && hasPassword && (
              <View style={[styles.settingItem, styles.settingItemLast]}>
                <View style={styles.settingIcon}>
                  <Ionicons name="finger-print" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Biometric Unlock</Text>
                  <Text style={styles.settingDescription}>
                    Use Face ID or Fingerprint
                  </Text>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={isBiometricEnabled ? '#FFFFFF' : colors.bg}
                />
              </View>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Nigerian Tax Calculator helps you calculate your taxes based on the 2026
              Nigeria Tax Act. All calculations include the latest tax brackets, reliefs,
              and allowances.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Password Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {hasPassword ? 'Change PIN' : 'Set 6-digit PIN'}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                placeholder="New 6-digit PIN"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPIN}
                keyboardType="numeric"
                maxLength={6}
                value={newPIN}
                onChangeText={setNewPIN}
              />
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                placeholder="Confirm 6-digit PIN"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPIN}
                keyboardType="numeric"
                maxLength={6}
                value={confirmPIN}
                onChangeText={setConfirmPIN}
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPIN(!showPIN)}
              >
                <Text style={{ color: colors.primary }}>
                  {showPIN ? 'Hide' : 'Show'} PIN
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.bg }]}
                onPress={() => setIsPasswordModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSavePIN}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}