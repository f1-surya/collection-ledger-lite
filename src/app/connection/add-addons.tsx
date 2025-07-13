import { db } from "@/db";
import { addonsTable, channelsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { captureException } from "@sentry/react-native";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, Checkbox, Divider, FAB, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddAddons() {
  const { connection } = useLocalSearchParams<{ connection: string }>();
  const { data } = useLiveQuery(
    db.query.channelsTable.findMany({ orderBy: channelsTable.name }),
  );
  const [channels, setChannels] = useState<number[]>([]);

  const handleSelect = (id: number) => {
    if (channels.includes(id)) {
      setChannels(channels.filter((channel) => channel !== id));
    } else {
      setChannels([...channels, id]);
    }
  };

  const save = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const promises: Promise<any>[] = [];
      for (const channel of channels) {
        promises.push(
          db
            .insert(addonsTable)
            .values({ channel, connection: parseInt(connection) }),
        );
      }
      await Promise.all(promises);
      router.back();
    } catch (e) {
      console.error(e);
      captureException(e);
      toast("Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        name="/connection/add-addons"
        options={{
          title: "Add addons",
          headerRight:
            channels.length > 0
              ? (props) => (
                  <Button {...props} onPressIn={save}>
                    Save
                  </Button>
                )
              : undefined,
        }}
      />
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              onPress={() => handleSelect(item.id)}
              left={(props) => (
                <Checkbox.Android
                  {...props}
                  status={channels.includes(item.id) ? "checked" : "unchecked"}
                />
              )}
            />
          )}
          ItemSeparatorComponent={Divider}
        />
      ) : (
        <Text variant="titleLarge" style={styles.empty}>
          No channels
        </Text>
      )}
      <FAB
        icon="plus"
        onPress={() => router.push("/create-channel")}
        style={styles.fab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 0,
    bottom: 0,
    margin: 10,
    borderRadius: 9999,
  },
  empty: {
    textAlign: "center",
    marginVertical: "auto",
  },
});
