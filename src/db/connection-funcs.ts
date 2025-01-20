import { startOfMonth } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from ".";
import {
  addonsTable,
  basePacksTable,
  connectionsTable,
  paymentsTable,
} from "./schema";

/**
 * This function marks a connection as paid by inserting a new payment
 * @param {number} connectionId Id of the connection
 * @param {typeof basePacksTable.$inferSelect} currentPack Current pack of the connection
 */
export const markConnectionAsPaid = async (
  connectionId: number,
  currentPack: typeof basePacksTable.$inferSelect,
) => {
  const today = new Date();
  let lcoPrice = currentPack.lcoPrice;
  let customerPrice = currentPack.customerPrice;

  const addons = await db.query.addonsTable.findMany({
    where: eq(addonsTable.connection, connectionId),
    with: {
      channel: true,
    },
  });

  if (addons.length > 0) {
    for (const addon of addons) {
      lcoPrice += addon.channel.lcoPrice;
      customerPrice += addon.channel.customerPrice;
    }
  }

  await Promise.all([
    db.insert(paymentsTable).values({
      connection: connectionId,
      currentPack: currentPack.id,
      lcoPrice,
      customerPrice,
    }),
    db
      .update(connectionsTable)
      .set({ lastPayment: today.getTime() })
      .where(eq(connectionsTable.id, connectionId)),
  ]);
};

/**
 * This function migrates a connection to a new pack by creating a migration
 * payment
 * @param {number} connectionId Id of the connection
 * @param {number} currentPack Id of the current pack
 * @param {number} toPackId Id of the pack to migrate to
 */
export const migratePack = async (
  connectionId: number,
  currentPack: number,
  toPackId: number,
) => {
  const today = new Date();
  const [payment, toPack] = await Promise.all([
    db.query.paymentsTable.findFirst({
      where: and(
        eq(paymentsTable.connection, connectionId),
        gte(paymentsTable.date, startOfMonth(today).getTime()),
        lte(paymentsTable.date, today.getTime()),
      ),
    }),
    db.query.basePacksTable.findFirst({
      where: eq(basePacksTable.id, toPackId),
    }),
  ]);

  if (!toPack) {
    throw new Error("Invalid pack");
  }

  if (payment) {
    await db
      .update(paymentsTable)
      .set({
        currentPack,
        to: toPackId,
        type: "migration",
        date: today.getTime(),
        lcoPrice: toPack.lcoPrice,
        customerPrice: toPack.customerPrice,
      })
      .where(eq(paymentsTable.id, connectionId));
  } else {
    await db.insert(paymentsTable).values({
      connection: connectionId,
      currentPack,
      to: toPackId,
      type: "migration",
      lcoPrice: toPack.lcoPrice,
      customerPrice: toPack.customerPrice,
    });
  }
  await db
    .update(connectionsTable)
    .set({ lastPayment: today.getTime(), basePack: toPackId })
    .where(eq(connectionsTable.id, connectionId));
};
