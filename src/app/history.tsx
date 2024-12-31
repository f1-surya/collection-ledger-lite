import { db } from "@/db";
import { paymentsTable } from "@/db/schema";
import i18n from "@/lib/i18";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import {
  Divider,
  Icon,
  List,
  SegmentedButtons,
  Surface,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";

const today = new Date();

export default function History() {
  const [paymentType, setPaymentType] = useState<"payment" | "migration">(
    "payment",
  );
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const { data } = useLiveQuery(
    db.query.paymentsTable.findMany({
      with: {
        connection: true,
        currentPack: true,
        to: true,
      },
      where: and(eq(paymentsTable.month, month), eq(paymentsTable.year, year)),
    }),
  );
  type Payments = NonNullable<typeof data>;
  const [payments, setPayments] = useState<Payments>([]);
  const theme = useColorScheme();

  useEffect(() => {
    if (month !== today.getMonth() + 1 || year !== today.getFullYear()) {
      db.query.paymentsTable
        .findMany({
          with: {
            connection: true,
            currentPack: true,
            to: true,
          },
          where: and(
            eq(paymentsTable.month, month),
            eq(paymentsTable.year, year),
          ),
        })
        .then((data) => {
          setPayments(data.filter((payment) => payment.type === paymentType));
        });
    } else if (data) {
      setPayments(data.filter((payment) => payment.type === paymentType));
    }
  }, [paymentType, data, month, year]);

  const renderPayment = (info: ListRenderItemInfo<Payments[number]>) => {
    let description = `Paid ${info.item.customerPrice} for ${info.item.currentPack.name}`;
    let icon = "receipt";

    if (info.item.type === "migration") {
      description = `Migrated to ${info.item.to!.name} from ${info.item.currentPack.name}`;
      icon = "sync";
    }

    return (
      <List.Item
        title={info.item.connection.name}
        description={description}
        left={(props) => <List.Icon {...props} icon={icon} />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <SegmentedButtons
        value={paymentType}
        onValueChange={(value) =>
          setPaymentType(value as "payment" | "migration")
        }
        buttons={[
          { label: "Payment", value: "payment" },
          { label: "Migration", value: "migration" },
        ]}
        style={{ margin: 10 }}
      />
      {payments.length > 0 ? (
        <FlashList
          data={payments}
          renderItem={renderPayment}
          estimatedItemSize={70}
          ItemSeparatorComponent={Divider}
        />
      ) : (
        <Text variant="titleMedium" style={{ textAlign: "center" }}>
          {i18n.get("noPayment")}
        </Text>
      )}
      <Surface style={styles.bottomBar} elevation={4}>
        <SelectDropdown
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          renderButton={(item, isOpened) => (
            <View style={styles.dropDownButton}>
              <Text>{month}</Text>
              <Icon
                source={isOpened ? "chevron-up" : "chevron-down"}
                size={25}
              />
            </View>
          )}
          renderItem={(item, _index, isSelected) => (
            <View
              style={
                theme === "dark"
                  ? styles.dropdownItemDark
                  : styles.dropdownItemLight
              }
            >
              <Text>{item}</Text>
              {isSelected && <Icon source="check" size={20} />}
            </View>
          )}
          onSelect={setMonth}
        />
        <SelectDropdown
          data={[2024, 2025]}
          renderButton={(item, isOpened) => (
            <View style={styles.dropDownButton}>
              <Text>{year}</Text>
              <Icon
                source={isOpened ? "chevron-up" : "chevron-down"}
                size={25}
              />
            </View>
          )}
          renderItem={(item, _index, isSelected) => (
            <View
              style={
                theme === "dark"
                  ? styles.dropdownItemDark
                  : styles.dropdownItemLight
              }
            >
              <Text>{item}</Text>
              {isSelected && <Icon source="check" size={20} />}
            </View>
          )}
          onSelect={setYear}
        />
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 20,
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemLight: {
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
  },
  dropdownItemDark: {
    backgroundColor: "gray",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropDownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    width: "25%",
    borderWidth: 2,
    borderColor: "gray",
  },
});
