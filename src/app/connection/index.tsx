import DeleteWarning from "@/components/delete-warning";
import { db } from "@/db";
import { markConnectionAsPaid } from "@/db/connection-funcs";
import { addonsTable, connectionsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { FlashList } from "@shopify/flash-list";
import { format, isThisMonth } from "date-fns";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Divider,
  Icon,
  IconButton,
  List,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewConnection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(
    db.query.connectionsTable.findFirst({
      where: eq(connectionsTable.id, parseInt(id)),
      with: {
        basePack: true,
        area: true,
      },
    }),
    [id],
  );
  const { data: addons } = useLiveQuery(
    db.query.addonsTable.findMany({
      where: eq(addonsTable.connection, parseInt(id)),
      with: { channel: true },
    }),
    [id],
  );
  const [currAddon, setCurrAddon] = useState<number | undefined>();
  const { t } = useTranslation();

  const markAsPaid = async () => {
    if (!data?.basePack) return;
    try {
      await markConnectionAsPaid(parseInt(id), data.basePack);
    } catch (e) {
      console.error(e);
      toast("Failed to mark as paid");
    }
  };

  const editConnection = async () => {
    router.push({
      pathname: "/connection/add-connection",
      params: { id },
    });
  };

  const deleteAddon = async (id: number) => {
    try {
      await db.delete(addonsTable).where(eq(addonsTable.id, id));
      toast("Successfully deleted");
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
    }
    setCurrAddon(undefined);
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        options={{
          title: "View connection",
          headerLeft: (props) => (
            <Appbar.BackAction
              {...props}
              style={{ margin: 0, width: "auto", marginRight: 25 }}
              onPress={router.back}
            />
          ),
        }}
      />
      <Card>
        <Card.Title
          title={`${t("customerName")}: ${data?.name}`}
          titleVariant="titleMedium"
          subtitle={`Box number: ${data?.boxNumber}`}
          subtitleVariant="titleSmall"
          right={(props) => (
            <IconButton
              {...props}
              icon="account-edit"
              onPress={editConnection}
            />
          )}
        />
        <Card.Content>
          <Text>Area: {data?.area?.name}</Text>
          <Text>Phone number: {data?.phoneNumber}</Text>
          <Text>Status: {data?.status}</Text>
          <Text>Current pack: {data?.basePack.name}</Text>
          <Text>
            {t("lastPayment")}:{" "}
            {data?.lastPayment &&
              format(new Date(data!.lastPayment), "dd/MM/yyyy")}
          </Text>
          <Divider />
          <View style={styles.prices}>
            <Text style={styles.price}>
              LCO price: ₹
              {(data?.basePack.lcoPrice ?? 0) +
                addons.reduce((acc, item) => acc + item.channel.lcoPrice, 0)}
              {"    "}
            </Text>
            <Text style={styles.price}>
              MRP: ₹
              {(data?.basePack.customerPrice ?? 0) +
                addons.reduce(
                  (acc, item) => acc + item.channel.customerPrice,
                  0,
                )}
            </Text>
          </View>
          <Divider />
        </Card.Content>
        <Card.Actions>
          <Button
            mode="text"
            onPress={() =>
              router.push({
                pathname: "/connection/pack-migration",
                params: { connectionId: id, currentPack: data?.basePack?.id },
              })
            }
          >
            Migration
          </Button>
          <Button
            disabled={
              Boolean(data?.lastPayment) && isThisMonth(data!.lastPayment!)
            }
            mode="text"
            onPress={markAsPaid}
          >
            {t("markAsPaid")}
          </Button>
        </Card.Actions>
      </Card>
      <View style={styles.paymentsHeader}>
        <Icon source="history" size={20} />
        <Text variant="titleMedium">Addons</Text>
        <IconButton
          icon="plus"
          mode="contained"
          size={20}
          style={{ marginLeft: "auto" }}
          onPress={() =>
            router.push({
              pathname: "/connection/add-addons",
              params: { connection: data!.id },
            })
          }
        />
      </View>
      {addons.length > 0 ? (
        <FlashList
          data={addons}
          renderItem={({ item }) => (
            <List.Item
              title={item.channel.name}
              left={(props) => <List.Icon {...props} icon="album" />}
              description={`LCO price: ₹${item.channel.lcoPrice} - MRP: ₹${item.channel.customerPrice}`}
              right={(props) => (
                <Pressable {...props} onPress={() => setCurrAddon(item.id)}>
                  <List.Icon color="red" icon="delete-outline" />
                </Pressable>
              )}
            />
          )}
          ItemSeparatorComponent={Divider}
          estimatedItemSize={60}
        />
      ) : (
        <Text
          variant="bodyMedium"
          style={{ textAlign: "center", marginTop: 10 }}
        >
          {t("noAddons")}
        </Text>
      )}
      <DeleteWarning
        open={Boolean(currAddon)}
        onClose={() => setCurrAddon(undefined)}
        onConfirm={() => deleteAddon(currAddon!)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 10,
    flex: 1,
  },
  paymentsHeader: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  prices: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  price: {
    fontWeight: "bold",
    color: "fuchsia",
  },
});
