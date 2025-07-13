import DeleteWarning from "@/components/delete-warning";
import { db } from "@/db";
import { addonsTable, channelsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { captureException } from "@sentry/react-native";
import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, ToastAndroid } from "react-native";
import { Divider, FAB, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Channels() {
  const { data } = useLiveQuery(db.query.channelsTable.findMany());
  const [currChannel, setCurrChannel] = useState<number | undefined>();
  const { t } = useTranslation();

  const deleteChannel = async () => {
    try {
      const addons = await db.query.addonsTable.findMany({
        where: eq(addonsTable.channel, currChannel!),
      });
      if (addons.length > 0) {
        toast(t("channelDelete"), ToastAndroid.LONG);
      } else {
        await db
          .delete(channelsTable)
          .where(eq(channelsTable.id, currChannel!));
      }
      toast("Successfully deleted");
    } catch (e) {
      console.error(e);
      captureException(e);
      toast("Something went wrong");
    }
    setCurrChannel(undefined);
  };

  return (
    <SafeAreaView style={styles.root}>
      {data.length > 0 ? (
        <FlashList
          data={data}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`LCO price: ₹${item.lcoPrice} - MRP: ₹${item.customerPrice}`}
              left={(props) => <List.Icon {...props} icon="album" />}
              right={(props) => (
                <Pressable onPress={() => setCurrChannel(item.id)} {...props}>
                  <List.Icon icon="delete-outline" color="red" />
                </Pressable>
              )}
              onPress={() =>
                router.push({
                  pathname: "/create-channel",
                  params: { id: item.id },
                })
              }
            />
          )}
          ItemSeparatorComponent={Divider}
        />
      ) : (
        <Text
          variant="bodyLarge"
          style={{ textAlign: "center", marginVertical: "auto" }}
        >
          {t("noChannels")}
        </Text>
      )}
      <DeleteWarning
        open={!!currChannel}
        onClose={() => setCurrChannel(undefined)}
        onConfirm={deleteChannel}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push("/create-channel")}
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
    borderRadius: 9999,
    margin: 10,
  },
});
