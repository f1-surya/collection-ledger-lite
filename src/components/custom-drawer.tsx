import { router } from "expo-router";
import { View } from "react-native";
import { Drawer, useTheme } from "react-native-paper";

const routes: {
  label: string;
  path:
    | "/history"
    | "/packs"
    | "/areas"
    | "/channels"
    | "/settings"
    | "/monthly-stats";
  icon: string;
}[] = [
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
  {
    label: "Monthly stats",
    path: "/monthly-stats",
    icon: "chart-arc",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "cog",
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
