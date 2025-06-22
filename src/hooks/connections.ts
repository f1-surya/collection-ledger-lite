import { db } from "@/db";
import {
  addonsTable,
  areasTable,
  basePacksTable,
  channelsTable,
  connectionsTable,
} from "@/db/schema";
import { mmkv } from "@/lib/mmkv";
import { isThisMonth } from "date-fns/isThisMonth";
import { eq, sql } from "drizzle-orm";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function useConnections() {
  const [connections, setConnections] = useState<GetConnectionsReturnType>([]);
  const [selectedArea, setSelectedArea] = useState(
    mmkv.getString("area") ?? "Area",
  );
  const [selectedStatus, setSelectedStatus] = useState(
    mmkv.getString("status") ?? "Status",
  );
  const [searchString, setSearchString] = useState("");
  const filteredConnections = useMemo(() => {
    let filteredConnections = [...connections];
    if (selectedArea !== "Area") {
      filteredConnections = filteredConnections.filter(
        (connection) => connection.area === selectedArea,
      );
    }
    if (selectedStatus !== "Status") {
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
      const target = searchString.toUpperCase();
      filteredConnections = filteredConnections.filter(
        (connection) =>
          connection.name.includes(target) ||
          connection.boxNumber.includes(target),
      );
    }
    return filteredConnections;
  }, [connections, selectedArea, selectedStatus, searchString]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(() => {
    getConnections().then((res) => setConnections(res));
  }, []);

  return {
    filteredConnections,
    refresh: fetchData,
    selectedArea,
    setSelectedArea,
    selectedStatus,
    setSelectedStatus,
    searchString,
    setSearchString,
  };
}

export type GetConnectionsReturnType = Awaited<
  ReturnType<typeof getConnections>
>;

function getConnections() {
  return db
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
    })
    .from(connectionsTable)
    .innerJoin(basePacksTable, eq(connectionsTable.basePack, basePacksTable.id))
    .innerJoin(areasTable, eq(connectionsTable.area, areasTable.id))
    .orderBy(connectionsTable.name);
}
