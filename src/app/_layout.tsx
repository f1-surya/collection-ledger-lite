import { db } from "@/db";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { RootSiblingParent } from "react-native-root-siblings";
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
  const { success } = useMigrations(db, migrations);

  return (
    <PaperProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? CombinedDarkTheme : CombinedLightTheme}
      >
        <RootSiblingParent>
          <Stack>
            <Stack.Screen
              name="add-connection"
              options={{ title: "Add connection" }}
            />
            <Stack.Screen
              name="view-connection"
              options={{ title: "View connection" }}
            />
          </Stack>
        </RootSiblingParent>
      </ThemeProvider>
    </PaperProvider>
  );
}
