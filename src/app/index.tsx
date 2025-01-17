import Dropdown from "@/components/drop-down";
import { db } from "@/db";
import { markConnectionAsPaid } from "@/db/connection-funcs";
import {
  addonsTable,
  areasTable,
  basePacksTable,
  channelsTable,
  connectionsTable,
} from "@/db/schema";
import { default as i18, default as i18n } from "@/lib/i18";
import toast from "@/lib/toast";
import { FlashList } from "@shopify/flash-list";
import { isThisMonth } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import Drawer from "expo-router/drawer";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  Icon,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { data } = useLiveQuery(
    db
      .select({
        id: connectionsTable.id,
        name: connectionsTable.name,
        boxNumber: connectionsTable.boxNumber,
        area: areasTable.name,
        phoneNumber: connectionsTable.phoneNumber,
        lastPayment: connectionsTable.lastPayment,
        basePack: { ...basePacksTable },
        addonPrices: sql<number>`
      COALESCE(
        (
          SELECT SUM(${channelsTable.customerPrice})
          FROM ${addonsTable}
          JOIN ${channelsTable} ON ${addonsTable.channel} = ${channelsTable.id}
          WHERE ${addonsTable.connection} = ${connectionsTable.id}
        ),
        0
      )
    `,
        addonPricesLco: sql<number>`
      COALESCE(
        (
          SELECT SUM(${channelsTable.lcoPrice})
          FROM ${addonsTable}
          JOIN ${channelsTable} ON ${addonsTable.channel} = ${channelsTable.id}
          WHERE ${addonsTable.connection} = ${connectionsTable.id}
        ),
        0
      )
    `,
      })
      .from(connectionsTable)
      .innerJoin(
        basePacksTable,
        eq(connectionsTable.basePack, basePacksTable.id),
      )
      .innerJoin(areasTable, eq(connectionsTable.area, areasTable.id))
      .orderBy(connectionsTable.name),
  );
  const { data: areas } = useLiveQuery(db.query.areasTable.findMany());
  const [connections, setConnections] = useState<typeof data>([]);
  const [currConnection, setCurrConnection] = useState<
    (typeof data)[number] | null
  >(null);
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchString, setSearchString] = useState("");
  const colorScheme = useColorScheme();

  useEffect(() => {
    let filteredConnections = [...data];
    if (selectedArea !== "All") {
      filteredConnections = filteredConnections.filter(
        (connection) => connection.area === selectedArea,
      );
    }
    if (selectedStatus !== "All") {
      filteredConnections = filteredConnections.filter((connection) => {
        let paid = false;
        if (
          connection.lastPayment &&
          isThisMonth(new Date(connection.lastPayment!))
        ) {
          paid = true;
        }
        if (selectedStatus === "Paid") {
          return paid;
        }
        return !paid;
      });
    }
    if (searchString.length > 0) {
      filteredConnections = filteredConnections.filter(
        (connection) =>
          connection.name.toLowerCase().includes(searchString) ||
          connection.boxNumber.toLowerCase().includes(searchString),
      );
    }
    setConnections(filteredConnections);
  }, [data, selectedArea, selectedStatus, searchString]);

  const viewConnection = () => {
    if (!currConnection) return;
    router.push({
      pathname: "/connection/view-connection",
      params: { id: currConnection?.id },
    });
    setCurrConnection(null);
  };

  const launchSmsTamil = () => {
    if (!currConnection) return;
    const uri = encodeURI(
      `sms://${currConnection.phoneNumber}?body=உங்கள் சந்தா தொகையை இந்த மாத இறுதிக்குள் செலுத்தவும்`,
    );
    Linking.openURL(uri);
  };

  const copySmc = () => {
    if (!currConnection) return;
    Clipboard.setStringAsync(currConnection.boxNumber);
    toast("SMC number copied to clipboard.");
  };

  const markAsPaid = async () => {
    if (!currConnection) return;
    try {
      await markConnectionAsPaid(currConnection.id, currConnection.basePack);
      setCurrConnection(null);
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
    }
  };

  return (
    <SafeAreaView
      style={{
        gap: 10,
        justifyContent: "center",
        flex: 1,
      }}
    >
      <Drawer.Screen
        options={{
          headerRight: (props) => (
            <Link
              {...props}
              href="/connection/add-connection"
              style={{ marginRight: 10 }}
            >
              <Icon source="plus" size={25} />
            </Link>
          ),
        }}
      />
      <Searchbar
        placeholder="Search..."
        value={searchString}
        onChangeText={(val) => setSearchString(val.toLowerCase())}
        style={{ marginTop: 10 }}
      />
      {connections.length === 0 && (
        <Text
          variant="titleMedium"
          style={{ textAlign: "center", paddingTop: 10 }}
        >
          {i18n.get("noConnections")}
        </Text>
      )}
      <FlashList
        data={connections}
        estimatedItemSize={100}
        renderItem={({ item }) => (
          <Card
            mode="elevated"
            onPress={() => setCurrConnection(item)}
            style={{ marginBottom: 10, marginHorizontal: 5 }}
          >
            <Card.Title
              title={item.name}
              titleVariant="titleLarge"
              subtitle={`SMC # ${item.boxNumber}  :  Pack: ${item.basePack.name}`}
              subtitleVariant="titleSmall"
              right={(props) => (
                <View
                  {...props}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 15,
                    backgroundColor:
                      item.lastPayment &&
                      isThisMonth(new Date(item.lastPayment))
                        ? "green"
                        : "red",
                    marginRight: 20,
                  }}
                />
              )}
            />
            <Card.Content style={styles.cardContent}>
              <Text style={styles.prices}>
                LCO price: ₹{item.basePack.lcoPrice + item.addonPricesLco}
              </Text>
              <Text style={styles.prices}>
                MRP: ₹{item.basePack.customerPrice + item.addonPrices}
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
              backgroundColor: colorScheme === "dark" ? "black" : "white",
            }}
          >
            <View style={styles.connectionInfo}>
              <View>
                <Text variant="titleLarge">{currConnection?.name}</Text>
                <Pressable onPress={copySmc}>
                  <Text>SMC #{currConnection?.boxNumber}</Text>
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
              style={{ color: colorScheme === "dark" ? "cyan" : "blue" }}
            >
              Plan name: {currConnection?.basePack.name}
            </Text>
            <View style={styles.address}>
              <Icon source="map-marker" size={20} />
              <Text variant="bodyLarge">{currConnection?.area}</Text>
            </View>
            <View
              style={[
                styles.contact,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "darkgray" : "lightgray",
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
                  Linking.openURL(`tel://${currConnection!.phoneNumber}`)
                }
              />
              <IconButton
                icon="whatsapp"
                mode="contained"
                onPress={() =>
                  Linking.openURL(
                    `https://wa.me/${currConnection!.phoneNumber}`,
                  )
                }
              />
              <Text variant="titleMedium">{currConnection?.phoneNumber}</Text>
            </View>
            <View style={[styles.cardContent, { marginTop: 10 }]}>
              <Text style={styles.prices}>
                LCO price: ₹
                {(currConnection?.basePack.lcoPrice ?? 0) +
                  (currConnection?.addonPricesLco ?? 0)}
              </Text>
              <Text style={styles.prices}>
                MRP: ₹
                {(currConnection?.basePack.customerPrice ?? 0) +
                  (currConnection?.addonPrices ?? 0)}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={markAsPaid}
                disabled={
                  Boolean(currConnection?.lastPayment) &&
                  isThisMonth(currConnection!.lastPayment!)
                }
              >
                {i18.get("markAsPaid")}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
      <Surface style={styles.filters}>
        <Dropdown
          data={areas ? [...areas.map((area) => area.name), "All"] : []}
          defaultValue={selectedArea}
          onChange={setSelectedArea}
        />
        <Dropdown
          data={["Paid", "Unpaid", "All"]}
          defaultValue={selectedStatus}
          onChange={setSelectedStatus}
        />
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  nameFilter: {
    width: "70%",
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
