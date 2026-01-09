import { ThemeProvider } from "@/hooks/userTheme";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/contexts/AuthContext";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ title: "Login" }} />
            <Stack.Screen name="register" options={{ title: "Register" }} />
            <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}
