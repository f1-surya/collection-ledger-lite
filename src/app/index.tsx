import { db } from "@/db";
import { markConnectionAsPaid } from "@/db/connection-funcs";
import { areasTable, basePacksTable, connectionsTable } from "@/db/schema";
import i18 from "@/lib/i18";
import { FlashList } from "@shopify/flash-list";
import { isThisMonth } from "date-fns";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  FAB,
  Icon,
  IconButton,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { data } = useLiveQuery(
    db
      .select()
      .from(connectionsTable)
      .innerJoin(
        basePacksTable,
        eq(connectionsTable.basePack, basePacksTable.id),
      )
      .innerJoin(areasTable, eq(connectionsTable.area, areasTable.id))
      .orderBy(connectionsTable.name),
  );
  const [connections, setConnections] = useState<typeof data>([]);
  const [currConnection, setCurrConnection] = useState<
    (typeof data)[number] | null
  >(null);
  const theme = useColorScheme();

  useEffect(() => {
    setConnections(data);
  }, [data]);

  const viewConnection = () => {
    if (!currConnection) return;
    router.push({
      pathname: "/connection/view-connection",
      params: { id: currConnection?.connections_table.id },
    });
    setCurrConnection(null);
  };

  const launchSmsTamil = () => {
    if (!currConnection) return;
    const uri = encodeURI(
      `sms://${currConnection.connections_table.phoneNumber}?body=உங்கள் சந்தா தொகையை இந்த மாத இறுதிக்குள் செலுத்தவும்`,
    );
    Linking.openURL(uri);
  };

  const copySmc = () => {
    if (!currConnection) return;
    Clipboard.setStringAsync(currConnection.connections_table.boxNumber);
    Toast.show("SMC number copied to clipboard.");
  };

  const markAsPaid = async () => {
    if (!currConnection) return;
    try {
      await markConnectionAsPaid(
        currConnection.connections_table.id,
        currConnection.base_packs_table,
      );
      setCurrConnection(null);
    } catch (e) {
      console.error(e);
      Toast.show("Something went wrong");
    }
  };

  return (
    <SafeAreaView
      style={{
        margin: 10,
        gap: 10,
        justifyContent: "center",
        flex: 1,
      }}
    >
      <FlashList
        data={connections}
        estimatedItemSize={100}
        renderItem={(item) => (
          <Card
            mode="elevated"
            onPress={() => setCurrConnection(item.item)}
            style={{ marginBottom: 10 }}
          >
            <Card.Title
              title={item.item.connections_table.name}
              titleVariant="titleLarge"
              subtitle={`SMC # ${item.item.connections_table.boxNumber}  :  Pack: ${item.item.base_packs_table.name}`}
              subtitleVariant="titleSmall"
              right={(props) => (
                <View
                  {...props}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 15,
                    backgroundColor:
                      item.item.connections_table.lastPayment &&
                      isThisMonth(
                        new Date(item.item.connections_table.lastPayment),
                      )
                        ? "green"
                        : "red",
                    marginRight: 20,
                  }}
                />
              )}
            />
            <Card.Content style={styles.cardContent}>
              <Text style={styles.prices}>
                LCO price: ₹{item.item.base_packs_table.lcoPrice}
              </Text>
              <Text style={styles.prices}>
                MRP: ₹{item.item.base_packs_table.customerPrice}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
      <Portal>
        <Modal
          visible={currConnection !== null}
          onDismiss={() => setCurrConnection(null)}
        >
          <View
            style={{
              padding: 10,
              margin: 10,
              borderRadius: 10,
              backgroundColor: theme === "dark" ? "black" : "white",
            }}
          >
            <View style={styles.connectionInfo}>
              <View>
                <Text variant="titleLarge">
                  {currConnection?.connections_table.name}
                </Text>
                <Pressable onPress={copySmc}>
                  <Text>
                    SMC #{currConnection?.connections_table.boxNumber}
                  </Text>
                </Pressable>
              </View>
              <IconButton
                icon="account"
                mode="contained"
                onPress={viewConnection}
              />
            </View>
            <Divider style={styles.divider} bold />
            <Text
              variant="titleMedium"
              style={{ color: theme === "dark" ? "cyan" : "blue" }}
            >
              Plan name: {currConnection?.base_packs_table.name}
            </Text>
            <View style={styles.address}>
              <Icon source="map-marker" size={20} />
              <Text variant="bodyLarge">
                {currConnection?.areas_table.name}
              </Text>
            </View>
            <View
              style={[
                styles.contact,
                {
                  backgroundColor: theme === "dark" ? "darkgray" : "lightgray",
                },
              ]}
            >
              <IconButton
                icon="android-messages"
                mode="contained"
                onPress={launchSmsTamil}
              />
              <IconButton
                icon="phone"
                mode="contained"
                onPress={() =>
                  Linking.openURL(
                    `tel://${currConnection!.connections_table.phoneNumber}`,
                  )
                }
              />
              <IconButton
                icon="whatsapp"
                mode="contained"
                onPress={() =>
                  Linking.openURL(
                    `https://wa.me/${currConnection!.connections_table.phoneNumber}`,
                  )
                }
              />
              <Text variant="titleMedium">
                {currConnection?.connections_table.phoneNumber}
              </Text>
            </View>
            <View style={[styles.cardContent, { marginTop: 10 }]}>
              <Text style={styles.prices}>
                LCO price: ₹{currConnection?.base_packs_table.lcoPrice}
              </Text>
              <Text style={styles.prices}>
                MRP: ₹{currConnection?.base_packs_table.customerPrice}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={markAsPaid}
                disabled={
                  Boolean(currConnection?.connections_table.lastPayment) &&
                  isThisMonth(currConnection!.connections_table.lastPayment!)
                }
              >
                {i18.get("markAsPaid")}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/connection/add-connection")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 9999,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prices: {
    fontWeight: "bold",
  },
  connectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  divider: {
    marginVertical: 10,
  },
  address: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  contact: {
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
});
