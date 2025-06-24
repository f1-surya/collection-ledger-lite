import { db } from "@/db";
import { areasTable, connectionsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, ToastAndroid } from "react-native";
import {
  Button,
  Dialog,
  Divider,
  FAB,
  List,
  Portal,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Areas() {
  const { data } = useLiveQuery(db.query.areasTable.findMany());
  const [currArea, setCurrArea] = useState<number | undefined>();
  const { t } = useTranslation();

  const deleteArea = async () => {
    try {
      if (currArea) {
        const connections = await db.query.connectionsTable.findMany({
          where: eq(connectionsTable.area, currArea),
        });
        if (connections.length > 0) {
          toast(t("areaDelete"), ToastAndroid.LONG);
        } else {
          await db.delete(areasTable).where(eq(areasTable.id, currArea));
          toast("Area successfully deleted.");
        }
      }
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
    }
    setCurrArea(undefined);
  };

  return (
    <SafeAreaView style={styles.root}>
      <FlashList
        data={data}
        renderItem={(info) => (
          <List.Item
            title={info.item.name}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={(props) => (
              <Pressable onPress={() => setCurrArea(info.item.id)}>
                <List.Icon {...props} color="red" icon="delete-outline" />
              </Pressable>
            )}
            onPress={() =>
              router.push({
                pathname: "/add-area",
                params: { id: info.item.id },
              })
            }
          />
        )}
        estimatedItemSize={56}
        ItemSeparatorComponent={Divider}
      />
      <Portal>
        <Dialog
          visible={currArea !== undefined}
          onDismiss={() => setCurrArea(undefined)}
        >
          <Dialog.Title>{t("warning")} !!!</Dialog.Title>
          <Dialog.Content>
            <Text>{t("deleteWarning")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCurrArea(undefined)}>Cancel</Button>
            <Button onPress={deleteArea}>Continue</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/add-area")}
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
});
