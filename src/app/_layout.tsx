import { db } from "@/db";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Drawer } from "expo-router/drawer";
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
          <Drawer>
            <Drawer.Screen name="index" options={{ title: "Connections" }} />
            <Drawer.Screen
              name="connection"
              options={{
                headerShown: false,
                drawerLabel: () => null,
              }}
            />
          </Drawer>
        </RootSiblingParent>
      </ThemeProvider>
    </PaperProvider>
  );
}
