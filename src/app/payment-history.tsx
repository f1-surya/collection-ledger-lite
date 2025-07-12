import DeleteWarning from "@/components/delete-warning";
import { db } from "@/db";
import { deletePayment } from "@/db/payments-functions";
import { paymentsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentHistory() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>();
  const { data } = useLiveQuery(
    db.query.paymentsTable.findMany({
      where: eq(paymentsTable.connection, parseInt(connectionId)),
      with: {
        currentPack: true,
        to: true,
      },
    }),
    [connectionId],
  );
  const [currPayment, setCurrPayment] = useState<
    (typeof data)[number] | undefined
  >();
  const { t } = useTranslation();

  const handleDelete = async () => {
    await deletePayment(currPayment!.id, parseInt(connectionId));
    setCurrPayment(undefined);
    toast("Successfully delete payment.");
  };

  const renderPayment = (info: ListRenderItemInfo<(typeof data)[number]>) => {
    let title = `Paid ${info.item.customerPrice} for ${info.item.currentPack.name}`;
    let icon = "receipt";

    if (info.item.type === "migration") {
      title = `Migrated to ${info.item.to!.name} from ${info.item.currentPack.name}`;
      icon = "sync";
    }

    return (
      <List.Item
        title={title}
        titleNumberOfLines={2}
        description={format(new Date(info.item.date), "dd MMM yyyy")}
        left={(props) => <List.Icon {...props} icon={icon} />}
        right={(props) => (
          <Pressable onPress={() => setCurrPayment(info.item)}>
            <List.Icon {...props} icon="delete-outline" color="red" />
          </Pressable>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {data.length > 0 ? (
        <FlashList
          data={data}
          renderItem={renderPayment}
          estimatedItemSize={70}
          ItemSeparatorComponent={Divider}
        />
      ) : (
        <Text variant="titleMedium" style={{ textAlign: "center" }}>
          {t("noPaymentForConnection")}
        </Text>
      )}
      <DeleteWarning
        open={currPayment != undefined}
        onClose={() => setCurrPayment(undefined)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 10,
  },
});
