import Dropdown from "@/components/drop-down";
import { db } from "@/db";
import { basePacksTable, connectionsTable, paymentsTable } from "@/db/schema";
import { startOfMonth, endOfMonth, parse, addMonths, format } from "date-fns";
import { and, gte, lte } from "drizzle-orm";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { List, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

let lastDate = parse("01/01/2025", "dd/MM/yyyy", new Date());
const months: { [key: string]: Date } = { "Jan 2025": lastDate };

for (let i = 0; i < 23; i++) {
  lastDate = addMonths(lastDate, 1);
  months[format(lastDate, "MMM yyyy")] = lastDate;
}

export default function () {
  const [totalConnections, setTotalConnections] = useState(0);
  const [paidConnections, setPaidConnections] = useState(0);
  const [packUsage, setPackUsage] = useState<{ [key: string]: number }>({});
  const [month, setMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    db.$count(connectionsTable).then((val) => setTotalConnections(val));
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const packs = await db.select().from(basePacksTable);
      const packNames: { [key: number]: string } = {};
      for (const pack of packs) {
        packNames[pack.id] = pack.name;
      }

      const monthEnd = endOfMonth(month);
      const payments = await db
        .select()
        .from(paymentsTable)
        .where(
          and(
            gte(paymentsTable.date, month.getTime()),
            lte(paymentsTable.date, monthEnd.getTime()),
          ),
        );
      const packNums: { [key: string]: number } = {};
      for (const payment of payments) {
        const packName = packNames[payment.currentPack];
        packNums[packName] = (packNums[packName] || 0) + 1;
      }

      setPaidConnections(payments.length);
      setPackUsage(packNums);
    };

    loadStats();
  }, [month]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.month}>
        <Text variant="titleSmall">Selected month:</Text>
        <Dropdown
          defaultValue={format(month, "MMM yyyy")}
          data={Object.keys(months)}
          onChange={(val) => setMonth(months[val])}
        />
      </View>
      <Text variant="titleMedium">Connections stats:</Text>
      <View style={styles.stats}>
        <Surface style={styles.statCard} elevation={4}>
          <Text variant="titleLarge" style={styles.paid}>
            {paidConnections}
          </Text>
          <Text variant="titleSmall" style={styles.paid}>
            Paid
          </Text>
        </Surface>
        <Surface style={styles.statCard} elevation={4}>
          <Text variant="titleLarge" style={styles.unpaid}>
            {totalConnections - paidConnections}
          </Text>
          <Text variant="titleSmall" style={styles.unpaid}>
            UnPaid
          </Text>
        </Surface>
      </View>
      <Text variant="titleMedium">Package usage:</Text>
      {Object.entries(packUsage).map(([packName, count]) => (
        <List.Item
          key={packName}
          left={(props) => <List.Icon {...props} icon="package" />}
          title={packName}
          description={`No. of connections: ${count}`}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  month: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  statCard: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
    borderRadius: 15,
  },
  paid: {
    color: "lime",
    fontWeight: 900,
  },
  unpaid: {
    color: "red",
    fontWeight: 900,
  },
});
