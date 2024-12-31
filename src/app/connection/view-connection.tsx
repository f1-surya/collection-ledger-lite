import { db } from "@/db";
import { markConnectionAsPaid } from "@/db/connection-funcs";
import { connectionsTable } from "@/db/schema";
import i18n from "@/lib/i18";
import { formatSqliteTimestamp } from "@/lib/time-utils";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { isThisMonth } from "date-fns";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
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
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewConnection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(
    db.query.connectionsTable.findFirst({
      where: eq(connectionsTable.id, parseInt(id)),
      with: {
        payments: {
          orderBy: (paymentsTable, { desc }) => [desc(paymentsTable.date)],
          with: {
            to: true,
            currentPack: true,
          },
        },
        basePack: true,
        area: true,
      },
    }),
  );

  const markAsPaid = async () => {
    if (!data?.basePack) return;
    try {
      await markConnectionAsPaid(parseInt(id), data.basePack);
    } catch (e) {
      console.error(e);
      Toast.show("Failed to mark as paid");
    }
  };

  const editConnection = async () => {
    router.push({
      pathname: "/connection/add-connection",
      params: { id },
    });
  };

  type Connection = NonNullable<typeof data>;
  type Payment = Connection["payments"][number];

  const renderPayments = (payment: ListRenderItemInfo<Payment>) => {
    let title = `Payment for ${payment.item.currentPack.name}`;
    let icon = "receipt";

    if (payment.item.type === "migration") {
      title = `Migration from ${payment.item.currentPack.name} to ${payment.item.to?.name}`;
      icon = "sync";
    }

    return (
      <List.Item
        title={title}
        titleNumberOfLines={2}
        description={formatSqliteTimestamp(payment.item.date)}
        left={(props) => <List.Icon {...props} icon={icon} />}
      />
    );
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
          title={`${i18n.get("customerName")}: ${data?.name}`}
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
            {i18n.get("lastPayment")}:{" "}
            {data?.lastPayment && formatSqliteTimestamp(data.lastPayment)}
          </Text>
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
            {i18n.get("markAsPaid")}
          </Button>
        </Card.Actions>
      </Card>
      {(data?.payments ?? []).length > 0 && (
        <View style={styles.paymentsHeader}>
          <Icon source="history" size={20} />
          <Text variant="titleMedium">{i18n.get("history")}</Text>
        </View>
      )}
      <FlashList
        data={data?.payments}
        renderItem={renderPayments}
        estimatedItemSize={100}
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
});
