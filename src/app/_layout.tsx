import { db } from "@/db";
import "@/lib/i18";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
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

Sentry.init({
  dsn: "https://2786e180c9c2dbff3b2d609340fe398c@o4509656318476288.ingest.de.sentry.io/4509656320507984",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

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
