import { ThemeProvider } from "@/hooks/userTheme";
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { TaxHistoryProvider } from "@/contexts/TaxHistoryContext";
import LockScreen from "@/components/LockScreen";

function RootLayoutContent() {
  const { isLocked } = useSecurity();

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SecurityProvider>
        <AuthProvider>
          <TaxHistoryProvider>
            <RootLayoutContent />
          </TaxHistoryProvider>
        </AuthProvider>
      </SecurityProvider>
    </ThemeProvider>
  );
}
