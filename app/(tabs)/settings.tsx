import React, { useState, useEffect } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, isBiometricAvailable, enableBiometrics, disableBiometrics, updateLocalUser } = useAuth();
  const router = useRouter();
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);

  // Fetch fresh user data from backend
  const convexUser = useQuery(api.users.getUser, user ? { userId: user.userId } : "skip");

  // Use convex data if available, otherwise fall back to local auth user
  const displayUser = convexUser || user;

  // Edit Profile State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfile = useMutation(api.users.updateProfile);
  const changePassword = useMutation(api.users.changePassword);

  const openEditModal = () => {
    if (displayUser) {
      setEditName(displayUser.name || '');
      setEditEmail(displayUser.email || '');
      setEditPassword('');
      setSelectedImage(displayUser.imageUrl || null);
      setIsEditModalVisible(true);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    setIsTogglingBiometric(true);
    try {
      if (value) {
        await enableBiometrics();
        Alert.alert('Success', 'Biometric authentication enabled');
      } else {
        await disableBiometrics();
        Alert.alert('Success', 'Biometric authentication disabled');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // 1. Validation
      if (editPassword.length > 0 && editPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // 2. OPTIMISTIC UPDATE
      const optimisticUpdates = {
        name: editName,
        email: editEmail,
        imageUrl: selectedImage
      };

      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");

      updateLocalUser(optimisticUpdates).catch(e => console.error("Local update failed", e));

      // 3. BACKGROUND SYNC
      (async () => {
        try {
          const promises = [];

          if (editPassword.length > 0) {
            promises.push(changePassword({
              userId: user.userId,
              newPassword: editPassword,
            }));
          }

          const profileUpdatePromise = (async () => {
            let profileImageId = undefined;

            if (selectedImage && (selectedImage.startsWith('file:') || selectedImage.startsWith('content:'))) {
              const manipulatedImage = await ImageManipulator.manipulateAsync(
                selectedImage,
                [{ resize: { width: 800 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
              );

              const postUrl = await generateUploadUrl();
              const response = await fetch(manipulatedImage.uri);
              const blob = await response.blob();
              const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": blob.type },
                body: blob,
              });
              const { storageId } = await result.json();
              profileImageId = storageId;
            }

            await updateProfile({
              userId: user.userId,
              name: editName,
              email: editEmail,
              profileImageId: profileImageId,
            });
          })();

          promises.push(profileUpdatePromise);
          await Promise.all(promises);

        } catch (error) {
          console.error("Background sync failed:", error);
        } finally {
          setIsSaving(false);
        }
      })();

    } catch (error: any) {
      setIsSaving(false);
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 24,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    editButton: {
      padding: 8,
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
    profileCard: {
      backgroundColor: colors.surface,
      margin: 16,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textMuted,
    },
    logoutButton: {
      backgroundColor: colors.danger,
      margin: 16,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
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
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalCloseText: {
      fontSize: 16,
      color: colors.primary,
    },
    modalContent: {
      padding: 20,
    },
    imagePicker: {
      alignItems: 'center',
      marginBottom: 24,
    },
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      overflow: 'hidden',
    },
    changePhotoText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            {displayUser?.imageUrl ? (
              <Image source={{ uri: displayUser.imageUrl }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person" size={40} color="#ffffff" />
            )}
          </View>
          <Text style={styles.profileName}>{displayUser?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{displayUser?.email}</Text>
        </View>

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
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingCard}>
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingIcon}>
                <Ionicons name="finger-print" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  {isBiometricAvailable
                    ? displayUser?.biometricEnabled
                      ? 'Enabled - Use fingerprint/Face ID to login'
                      : 'Enable fingerprint/Face ID login'
                    : 'Not available on this device'}
                </Text>
              </View>
              {isBiometricAvailable && (
                <Switch
                  value={displayUser?.biometricEnabled || false}
                  onValueChange={handleBiometricToggle}
                  disabled={isTogglingBiometric}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#ffffff"
                />
              )}
            </View>
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

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} disabled={isSaving}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={isSaving}>
              <View style={styles.imagePreview}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person" size={40} color={colors.textMuted} />
                )}
              </View>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password (Optional)</Text>
              <TextInput
                style={styles.input}
                value={editPassword}
                onChangeText={setEditPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSaving}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}