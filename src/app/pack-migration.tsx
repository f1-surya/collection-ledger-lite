import { db } from "@/db";
import { migratePack } from "@/db/connection-funcs";
import { basePacksTable } from "@/db/schema";
import { ne } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Checkbox, Divider, FAB, List, Text } from "react-native-paper";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PackMigration() {
  const { connectionId, currentPack } = useLocalSearchParams<{
    connectionId: string;
    currentPack: string;
  }>();
  const { data } = useLiveQuery(
    db
      .select()
      .from(basePacksTable)
      .where(ne(basePacksTable.id, parseInt(currentPack)))
      .orderBy(basePacksTable.name),
  );
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const save = async () => {
    if (!selectedPack || !connectionId) return;
    try {
      await migratePack(
        parseInt(connectionId),
        parseInt(currentPack),
        selectedPack,
      );
      router.back();
    } catch (e) {
      console.error(e);
      Toast.show("Failed to migrate pack");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        options={{
          title: "Pack Migration",
          headerRight: selectedPack
            ? () => <Button onPress={save}>Save</Button>
            : undefined,
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={(info) => (
          <List.Item
            title={info.item.name}
            left={(props) => (
              <Checkbox.Android
                {...props}
                status={selectedPack === info.item.id ? "checked" : "unchecked"}
              />
            )}
            right={(props) => (
              <View {...props}>
                <Text variant="titleSmall">
                  LCO price: ₹{info.item.lcoPrice}
                </Text>
                <Text variant="titleSmall">
                  MRP: ₹{info.item.customerPrice}
                </Text>
              </View>
            )}
            onPress={() => setSelectedPack(info.item.id)}
          />
        )}
        ItemSeparatorComponent={Divider}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/add-pack")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    margin: 10,
  },
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 9999,
  },
});
