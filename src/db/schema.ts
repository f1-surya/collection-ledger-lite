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
    lastPayment: t.int(),
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

export const channelsTable = t.sqliteTable(
  "channels_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    name: t.text().notNull(),
    lcoPrice: t.int().notNull(),
    customerPrice: t.int().notNull(),
  },
  () => [],
);

export const channelsRelations = relations(channelsTable, ({ one }) => ({
  addon: one(addonsTable, {
    fields: [channelsTable.id],
    references: [addonsTable.channel],
  }),
}));

export const addonsTable = t.sqliteTable(
  "addons_table",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    channel: t
      .int()
      .references(() => channelsTable.id)
      .notNull(),
    connection: t
      .int()
      .references(() => connectionsTable.id)
      .notNull(),
  },
  (table) => [t.index("connectionIndex").on(table.connection)],
);

export const addonRelations = relations(addonsTable, ({ one }) => ({
  connection: one(connectionsTable, {
    fields: [addonsTable.connection],
    references: [connectionsTable.id],
  }),
  channel: one(channelsTable, {
    fields: [addonsTable.channel],
    references: [channelsTable.id],
  }),
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
      .int()
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
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
    customerPrice: t.int().notNull(),
    lcoPrice: t.int().notNull(),
  },
  (table) => [t.index("date").on(table.date)],
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
