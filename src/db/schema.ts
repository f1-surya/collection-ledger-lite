import * as t from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";
import { sql } from "drizzle-orm";

export const areasTable = t.sqliteTable(
  "areas_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    name: t.text().notNull(),
  },
  () => [],
);

export const connectionsTable = t.sqliteTable(
  "connections_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    name: t.text().notNull(),
    boxNumber: t.text().notNull(),
    area: t.int().references(() => areasTable.id),
    phoneNumber: t.text(),
    basePack: t.int().references(() => basePacksTable.id),
    status: t.text().$type<"active" | "in-active">().default("active"),
    ...timestamps,
  },
  (table) => [
    t.index("boxNumberIndex").on(table.boxNumber),
    t.index("areaIndex").on(table.area),
  ],
);

export const basePacksTable = t.sqliteTable(
  "base_packs_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    name: t.text().notNull(),
    lcoPrice: t.int().notNull(),
    customerPrice: t.int().notNull(),
  },
  () => [],
);

export const addonsTable = t.sqliteTable(
  "addons_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    name: t.text().notNull(),
    connection: t.int().references(() => connectionsTable.id),
  },
  () => [],
);

export const paymentsTable = t.sqliteTable(
  "payments_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    connection: t.int().references(() => connectionsTable.id),
    paymentDate: t.text().default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [t.index("connectionIndex").on(table.connection)],
);
