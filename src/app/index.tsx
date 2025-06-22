import ConnectionDialog from "@/components/connection-dialog";
import CustomDrawer from "@/components/custom-drawer";
import Dropdown from "@/components/drop-down";
import { db } from "@/db";
import useConnections, {
  type GetConnectionsReturnType,
} from "@/hooks/connections";
import { default as i18n } from "@/lib/i18";
import { mmkv } from "@/lib/mmkv";
import { FlashList } from "@shopify/flash-list";
import { isThisMonth } from "date-fns";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, Stack } from "expo-router";
import { useRef, useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import "react-native-gesture-handler";
import {
  Card,
  IconButton,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const {
    filteredConnections: connections,
    searchString,
    selectedArea,
    selectedStatus,
    setSearchString,
    setSelectedArea,
    setSelectedStatus,
    refresh,
  } = useConnections();
  const { data: areas } = useLiveQuery(db.query.areasTable.findMany());
  const [currConnection, setCurrConnection] = useState<
    GetConnectionsReturnType[number] | null
  >(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const searchBar = useRef<TextInput | null>(null);

  return (
    <SafeAreaView
      style={{
        gap: 10,
        justifyContent: "center",
        flex: 1,
      }}
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton
              testID="menu-button"
              icon="menu"
              onPressIn={() => setDrawerOpen((prev) => !prev)}
              style={{ marginLeft: 0 }}
            />
          ),
          headerRight: (props) => (
            <IconButton
              {...props}
              testID="add-connection-button"
              icon="plus"
              onPressIn={() => router.push("/connection/add-connection")}
            />
          ),
        }}
      />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        drawerStyle={{ backgroundColor: theme.colors.surface }}
        renderDrawerContent={CustomDrawer}
      >
        <Searchbar
          placeholder="Search..."
          value={searchString}
          onChangeText={(val) => setSearchString(val.toLowerCase())}
          ref={searchBar}
          onClearIconPress={() => searchBar.current?.focus()}
          style={styles.searchBar}
        />
        {connections.length === 0 && (
          <Text variant="titleMedium" style={styles.noConnections}>
            {i18n.get("noConnections")}
          </Text>
        )}
        <FlashList
          data={connections}
          estimatedItemSize={100}
          keyboardShouldPersistTaps="handled"
          refreshing={false}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <Card
              mode="elevated"
              onPress={() => {
                Keyboard.dismiss();
                setCurrConnection(item);
              }}
              style={styles.connection}
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
              <Card.Content>
                <Text style={styles.prices}>
                  MRP: ₹{item.basePack.customerPrice + item.addonPrices}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
        <ConnectionDialog
          currConnection={currConnection}
          setCurrConnection={setCurrConnection}
        />
        <Surface style={styles.filters}>
          <Dropdown
            data={areas ? [...areas.map((area) => area.name), "Area"] : []}
            defaultValue={selectedArea}
            onChange={(val) => {
              setSelectedArea(val);
              mmkv.set("area", val);
            }}
          />
          <Dropdown
            data={["Paid", "Unpaid", "Status"]}
            defaultValue={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              mmkv.set("status", val);
            }}
          />
        </Surface>
      </Drawer>
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
  noConnections: {
    textAlign: "center",
    padding: 10,
  },
  connection: {
    marginBottom: 10,
    marginHorizontal: 5,
  },
  searchBar: {
    margin: 6,
  },
});
