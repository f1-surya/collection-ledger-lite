import { router } from "expo-router";
import { View } from "react-native";
import { Drawer, useTheme } from "react-native-paper";

const routes: {
  label: string;
  path: "/" | "/history" | "/packs" | "/areas" | "/channels";
  icon: "home" | "clock" | "package" | "map" | "layers";
}[] = [
  {
    label: "Connections",
    path: "/",
    icon: "home",
  },
  {
    label: "History",
    path: "/history",
    icon: "clock",
  },
  {
    label: "Packs",
    path: "/packs",
    icon: "package",
  },
  {
    label: "Areas",
    path: "/areas",
    icon: "map",
  },
  {
    label: "Channels",
    path: "/channels",
    icon: "layers",
  },
];

export default function CustomDrawer() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      {routes.map((route) => (
        <Drawer.Item
          icon={route.icon}
          key={route.path}
          label={route.label}
          onPress={() => router.push(route.path)}
        />
      ))}
    </View>
  );
}
