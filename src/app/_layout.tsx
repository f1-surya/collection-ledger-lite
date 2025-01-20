import { db } from "@/db";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { BackHandler, useColorScheme } from "react-native";
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
  const { error } = useMigrations(db, migrations);
  console.log(error);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return false;
    });
  }, []);

  return (
    <PaperProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? CombinedDarkTheme : CombinedLightTheme}
      >
        <Drawer>
          <Drawer.Screen name="index" options={{ title: "Connections" }} />
          <Drawer.Screen
            name="connection"
            options={{
              headerShown: false,
              drawerItemStyle: { display: "none" },
            }}
          />
          <Drawer.Screen name="history" options={{ title: "History" }} />
          <Drawer.Screen
            name="packs"
            options={{ title: "Base packs", drawerLabel: "Base packs" }}
          />
          <Drawer.Screen
            name="areas"
            options={{ title: "Areas", drawerLabel: "Areas" }}
          />
          <Drawer.Screen
            name="channels"
            options={{ title: "Channels", drawerLabel: "Channels" }}
          />
        </Drawer>
      </ThemeProvider>
    </PaperProvider>
  );
}
