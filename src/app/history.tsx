import DeleteWarning from "@/components/delete-warning";
import { db } from "@/db";
import { deletePayment } from "@/db/payments-functions";
import { paymentsTable } from "@/db/schema";
import { askPermission, saveFile, saveFileLocal } from "@/lib/file-system";
import { writeCsv } from "@/lib/sheet";
import toast from "@/lib/toast";
import { captureException } from "@sentry/react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { format, startOfMonth } from "date-fns";
import { and, desc, gte, lte } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";
import {
  Button,
  Divider,
  List,
  SegmentedButtons,
  Surface,
  Text,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";
import Share from "react-native-share";

export default function History() {
  const [paymentType, setPaymentType] = useState<"payment" | "migration">(
    "payment",
  );
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
  });
  const { data } = useLiveQuery(
    db.query.paymentsTable.findMany({
      with: {
        connection: true,
        currentPack: true,
        to: true,
      },
      where: and(
        gte(paymentsTable.date, dates.startDate.getTime()),
        lte(paymentsTable.date, dates.endDate.getTime()),
      ),
      orderBy: desc(paymentsTable.date),
    }),
    [dates],
  );
  const { t } = useTranslation();
  type Payments = NonNullable<typeof data>;
  const [currPayment, setCurrPayment] = useState<
    Payments[number] | undefined
  >();

  const exportData = async () => {
    try {
      const outfile = writeCsv([
        ["VC Number"],
        ...data
          .filter((payment) => payment.type === "payment")
          .map((payment) => payment.connection.boxNumber)
          .map((no) => [no]),
      ]);

      const filename = `payment-${dates.startDate.getMonth() + 1}-${dates.startDate.getFullYear()}.csv`;
      const permissions = await askPermission();
      if (!permissions.granted) {
        return;
      }
      const files = [];
      try {
        await saveFile(filename, outfile, "text/csv", permissions.directoryUri);
      } catch {
        console.log("Save to downloads failed. Invoking share...");
        const uri = await saveFileLocal(filename, outfile);
        files.push(uri);
      }
      const migrationPayments = data.filter(
        (payment) => payment.type === "migration",
      );

      // Get list of payments with same to
      const migrationPaymentsGrouped = migrationPayments.reduce(
        (acc, payment) => {
          const key = payment.to!.name;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(payment);
          return acc;
        },
        {} as Record<string, Payments>,
      );
      for (const [to, payments] of Object.entries(migrationPaymentsGrouped)) {
        const migrationOutfile = writeCsv([
          ["VC Number"],
          ...payments.map((payment) => [payment.connection.boxNumber]),
        ]);
        // Save the file
        const migrationFilename =
          `migration-${to}-${dates.startDate.getMonth() + 1}-${dates.startDate.getFullYear()}.csv`.replaceAll(
            " ",
            "-",
          );
        try {
          await saveFile(
            migrationFilename,
            migrationOutfile,
            "text/csv",
            permissions.directoryUri,
          );
        } catch {
          const uri = await saveFileLocal(migrationFilename, migrationOutfile);
          files.push(uri);
        }
      }
      if (files.length > 0) {
        Share.open({ urls: files });
      }

      toast("Files exported successfully");
    } catch (error) {
      console.error(error);
      captureException(error);
      toast("Failed to export file");
    }
  };

  const handleDelete = async () => {
    await deletePayment(currPayment!.id, currPayment!.connection.id);
    setCurrPayment(undefined);
    toast("Successfully delete payment.");
  };

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
      {data.length > 0 ? (
        <FlashList
          data={data.filter((payment) => payment.type === paymentType)}
          renderItem={renderPayment}
          estimatedItemSize={70}
          ItemSeparatorComponent={Divider}
        />
      ) : (
        <Text variant="titleMedium" style={{ textAlign: "center" }}>
          {t("noPayment")}
        </Text>
      )}
      <DeleteWarning
        open={currPayment != undefined}
        onClose={() => setCurrPayment(undefined)}
        onConfirm={handleDelete}
      />
      <Surface style={styles.bottomBar} elevation={4}>
        <Button mode="outlined" onPress={() => setOpen(true)}>
          {format(dates.startDate, "dd-MM-yyyy")} -{" "}
          {format(dates.endDate, "dd-MM-yyyy")}
        </Button>
        <Button
          mode="contained"
          onPress={exportData}
          disabled={data.length === 0}
        >
          Export
        </Button>
      </Surface>
      <DatePickerModal
        locale="en"
        visible={open}
        onDismiss={() => setOpen(false)}
        mode="range"
        startDate={dates.startDate}
        endDate={dates.endDate}
        onConfirm={({ startDate, endDate }) => {
          if (startDate && endDate) {
            setOpen(false);
            setDates({ startDate, endDate });
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginHorizontal: 5,
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
