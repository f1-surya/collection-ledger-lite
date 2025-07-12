import { db } from "@/db";
import "@/lib/i18";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import migrations from "../../drizzle/migrations";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedLightTheme = {
  ...NavigationDefaultTheme,
  ...LightTheme,
};

const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...DarkTheme,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useMigrations(db, migrations);
  const isDarkMode = colorScheme === "dark";

  return (
    <PaperProvider>
      <ThemeProvider
        value={isDarkMode ? CombinedDarkTheme : CombinedLightTheme}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={isDarkMode ? "#000000" : "#ffffff"}
        />
        <Stack>
          <Stack.Screen name="index" options={{ title: "Connections" }} />
          <Stack.Screen name="connection" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ title: "History" }} />
          <Stack.Screen name="packs" options={{ title: "Base packs" }} />
          <Stack.Screen name="areas" options={{ title: "Areas" }} />
          <Stack.Screen name="channels" options={{ title: "Channels" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen
            name="monthly-stats"
            options={{ title: "Monthly stats" }}
          />
          <Stack.Screen
            name="payment-history"
            options={{ title: "Payment history" }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
