import * as t from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";
import { relations, sql } from "drizzle-orm";

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
    area: t
      .int()
      .notNull()
      .references(() => areasTable.id),
    phoneNumber: t.text(),
    basePack: t
      .int()
      .notNull()
      .references(() => basePacksTable.id),
    status: t
      .text()
      .notNull()
      .$type<"active" | "in-active">()
      .default("active"),
    lastPayment: t.text(),
    ...timestamps,
  },
  (table) => [
    t.index("boxNumberIndex").on(table.boxNumber),
    t.index("areaIndex").on(table.area),
  ],
);

export const connectionRelations = relations(
  connectionsTable,
  ({ one, many }) => ({
    payments: many(paymentsTable),
    area: one(areasTable, {
      fields: [connectionsTable.area],
      references: [areasTable.id],
    }),
    addons: many(addonsTable),
    basePack: one(basePacksTable, {
      fields: [connectionsTable.basePack],
      references: [basePacksTable.id],
    }),
  }),
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

export const basePackRelations = relations(basePacksTable, ({ many }) => ({
  connection: many(connectionsTable),
}));

export const addonsTable = t.sqliteTable(
  "addons_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    name: t.text().notNull(),
    connection: t.int().references(() => connectionsTable.id),
  },
  () => [],
);

export const addonRelations = relations(addonsTable, ({ many }) => ({
  connection: many(connectionsTable),
}));

export const paymentsTable = t.sqliteTable(
  "payments_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    connection: t
      .int()
      .notNull()
      .references(() => connectionsTable.id),
    date: t
      .text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    currentPack: t
      .int()
      .notNull()
      .references(() => basePacksTable.id),
    to: t.int().references(() => basePacksTable.id),
    type: t
      .text()
      .notNull()
      .$type<"migration" | "payment">()
      .default("payment"),
    month: t.int().notNull(),
    year: t.int().notNull(),
    customerPrice: t.int().notNull(),
    lcoPrice: t.int().notNull(),
  },
  () => [],
);

export const paymentRelations = relations(paymentsTable, ({ one }) => ({
  connection: one(connectionsTable, {
    fields: [paymentsTable.connection],
    references: [connectionsTable.id],
  }),
  currentPack: one(basePacksTable, {
    fields: [paymentsTable.currentPack],
    references: [basePacksTable.id],
  }),
  to: one(basePacksTable, {
    fields: [paymentsTable.to],
    references: [basePacksTable.id],
  }),
}));
