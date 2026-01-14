import React from 'react'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// AsyncStorage is React Native’s simple, promise-based API for persisting small bits of data on a user’s device. Think of it as the mobile-app equivalent of the browser’s localStorage, but asynchronous and cross-platform.

export interface ColorScheme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  gradients: {
    background: [string, string];
    surface: [string, string];
    primary: [string, string];
    success: [string, string];
    warning: [string, string];
    danger: [string, string];
    muted: [string, string];
    empty: [string, string];
  };
  backgrounds: {
    input: string;
    editInput: string;
  };
  statusBarStyle: "light-content" | "dark-content";
}

const lightColors: ColorScheme = {
  bg: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#757575",
  border: "#E0E0E0",
  primary: "#00C853", // OPay green - money symbolism
  success: "#00E676",
  warning: "#FFA726",
  danger: "#EF5350",
  shadow: "#000000",
  gradients: {
    background: ["#F5F5F5", "#E8F5E9"],
    surface: ["#FFFFFF", "#F1F8E9"],
    primary: ["#00C853", "#00E676"],
    success: ["#00E676", "#69F0AE"],
    warning: ["#FFA726", "#FF9800"],
    danger: ["#EF5350", "#E53935"],
    muted: ["#BDBDBD", "#9E9E9E"],
    empty: ["#F5F5F5", "#EEEEEE"],
  },
  backgrounds: {
    input: "#FFFFFF",
    editInput: "#FFFFFF",
  },
  statusBarStyle: "dark-content" as const,
};

const darkColors: ColorScheme = {
  bg: "#121212",
  surface: "#1E1E1E",
  text: "#FFFFFF",
  textMuted: "#B0B0B0",
  border: "#2C2C2C",
  primary: "#00E676", // Brighter green for dark mode
  success: "#69F0AE",
  warning: "#FFB74D",
  danger: "#EF5350",
  shadow: "#000000",
  gradients: {
    background: ["#121212", "#1E1E1E"],
    surface: ["#1E1E1E", "#2C2C2C"],
    primary: ["#00E676", "#69F0AE"],
    success: ["#69F0AE", "#B9F6CA"],
    warning: ["#FFB74D", "#FFA726"],
    danger: ["#EF5350", "#E57373"],
    muted: ["#424242", "#616161"],
    empty: ["#2C2C2C", "#3C3C3C"],
  },
  backgrounds: {
    input: "#1E1E1E",
    editInput: "#121212",
  },
  statusBarStyle: "light-content" as const,
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ColorScheme;
}

const ThemeContext = createContext<undefined | ThemeContextType>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // get the user's choice
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value) setIsDarkMode(JSON.parse(value));
    });
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default useTheme;