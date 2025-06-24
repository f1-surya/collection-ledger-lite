import DeleteWarning from "@/components/delete-warning";
import { db } from "@/db";
import { basePacksTable, connectionsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, ToastAndroid } from "react-native";
import { Divider, FAB, List } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Packs() {
  const { data } = useLiveQuery(db.query.basePacksTable.findMany());
  const [currPack, setCurrPack] = useState<number | undefined>();
  const { t } = useTranslation();

  const deletePack = async () => {
    try {
      const connections = await db.query.connectionsTable.findMany({
        where: eq(connectionsTable.basePack, currPack!),
      });
      if (connections.length > 0) {
        toast(t("migrateBeforeDelete"), ToastAndroid.LONG);
      } else {
        await db.delete(basePacksTable).where(eq(basePacksTable.id, currPack!));
        toast("Successfully deleted");
      }
      setCurrPack(undefined);
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
    }
  };

  return (
    <SafeAreaView style={style.root}>
      <FlashList
        data={data}
        estimatedItemSize={50}
        ItemSeparatorComponent={Divider}
        renderItem={(info) => (
          <List.Item
            title={info.item.name}
            description={`LCO price: ${info.item.lcoPrice} - MRP: ${info.item.customerPrice}`}
            left={(props) => <List.Icon {...props} icon="package" />}
            onPress={() =>
              router.push({
                pathname: "/add-pack",
                params: { id: info.item.id },
              })
            }
            right={(props) => (
              <Pressable {...props} onPress={() => setCurrPack(info.item.id)}>
                <List.Icon icon="delete-outline" color="red" />
              </Pressable>
            )}
          />
        )}
      />
      <DeleteWarning
        open={currPack !== undefined}
        onClose={() => setCurrPack(undefined)}
        onConfirm={deletePack}
      />
      <FAB
        icon="plus"
        style={style.fab}
        onPress={() => router.push("/add-pack")}
      />
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
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
