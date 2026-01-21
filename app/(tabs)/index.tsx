import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '@/hooks/userTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useTaxMode } from '@/contexts/TaxModeContext';
import TaxModeToggle from '@/components/TaxModeToggle';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { taxMode } = useTaxMode();

  const navigateToCalculator = (type: 'monthly' | 'annual' | 'weekly') => {
    router.push({
      pathname: '/(tabs)/calculator',
      params: { incomeType: type, reset: 'true' }
    });
  };

  const navigateToEducation = () => {
    router.push('/(tabs)/education');
  };

  const handleOpenTINWebsite = async () => {
    const url = 'https://taxid.nrs.gov.ng/';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open the TIN registration website');
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
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
    content: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary + '20', // 20% opacity
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Taxpayer 👋</Text>
        <Text style={styles.subtitle}>Welcome to your Tax Assistant</Text>
      </View>

      <ScrollView style={styles.content}>
        <TaxModeToggle />

        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        {taxMode === 'personal' ? (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigateToCalculator('monthly')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Calculate Monthly Tax</Text>
                <Text style={styles.cardDescription}>Compute taxes on your monthly earnings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigateToCalculator('annual')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="calendar-number-outline" size={24} color="#10b981" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Calculate Annual Tax</Text>
                <Text style={styles.cardDescription}>Compute taxes on your yearly income</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigateToCalculator('weekly')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#6366f120' }]}>
                <Ionicons name="time-outline" size={24} color="#6366f1" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Calculate Weekly Tax</Text>
                <Text style={styles.cardDescription}>Compute taxes on your weekly earnings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigateToCalculator('annual')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="briefcase-outline" size={24} color="#f59e0b" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Calculate Business Tax</Text>
              <Text style={styles.cardDescription}>Compute company income tax and development levy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.card}
          onPress={navigateToEducation}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Education & Guide</Text>
            <Text style={styles.cardDescription}>Learn about the 2026 Nigeria Tax Act</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={handleOpenTINWebsite}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#ef444420' }]}>
            <Ionicons name="card-outline" size={24} color="#ef4444" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Get Your TIN</Text>
            <Text style={styles.cardDescription}>Register for a Tax Identification Number</Text>
          </View>
          <Ionicons name="open-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}