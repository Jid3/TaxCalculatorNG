import { ThemeProvider, default as useTheme } from "@/hooks/userTheme";
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { TaxHistoryProvider } from "@/contexts/TaxHistoryContext";
import { TaxModeProvider } from "@/contexts/TaxModeContext";
import LockScreen from "@/components/LockScreen";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";

function RootLayoutContent() {
  const { isLocked } = useSecurity();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('transparent');
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Navigation Bar
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('transparent');

      // Status Bar (imperative update for consistency)
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Navigation Bar icons
      NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark');
      // Root Background
      SystemUI.setBackgroundColorAsync(isDarkMode ? '#121212' : '#F5F5F5');
      // Status Bar icons
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    }
  }, [isDarkMode]);

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SecurityProvider>
        <AuthProvider>
          <TaxHistoryProvider>
            <TaxModeProvider>
              <RootLayoutContent />
            </TaxModeProvider>
          </TaxHistoryProvider>
        </AuthProvider>
      </SecurityProvider>
    </ThemeProvider>
  );
}
