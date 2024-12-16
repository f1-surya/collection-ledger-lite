import { db } from "@/db";
import { connectionsTable } from "@/db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { data: connections } = useLiveQuery(
    db.select().from(connectionsTable),
  );

  return (
    <SafeAreaView
      style={{
        margin: 20,
        gap: 10,
        justifyContent: "center",
        flex: 1,
      }}
    >
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          borderRadius: 9999,
        }}
        onPress={() => router.push("/add-connection")}
      />
    </SafeAreaView>
  );
}
