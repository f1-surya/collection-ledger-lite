import { startOfMonth } from "date-fns";
import { and, desc, eq, gt, gte, lt, lte } from "drizzle-orm";
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
  const existingPayment = await db.query.paymentsTable.findFirst({
    where: and(
      eq(paymentsTable.connection, connectionId),
      gt(paymentsTable.date, startOfMonth(today).getTime()),
      lt(paymentsTable.date, today.getTime()),
    ),
  });
  if (existingPayment) {
    return;
  }
  await db.transaction(async (tx) => {
    // Calculate total prices including base pack and all addon channels
    let lcoPrice = currentPack.lcoPrice;
    let customerPrice = currentPack.customerPrice;

    const addons = await tx.query.addonsTable.findMany({
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
      tx.insert(paymentsTable).values({
        connection: connectionId,
        currentPack: currentPack.id,
        lcoPrice,
        customerPrice,
      }),
      tx
        .update(connectionsTable)
        .set({ lastPayment: today.getTime() })
        .where(eq(connectionsTable.id, connectionId)),
    ]);
  });
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
  await db.transaction(async (tx) => {
    const today = new Date();
    const [payment, toPack] = await Promise.all([
      tx.query.paymentsTable.findFirst({
        where: and(
          eq(paymentsTable.connection, connectionId),
          gte(paymentsTable.date, startOfMonth(today).getTime()),
          lte(paymentsTable.date, today.getTime()),
        ),
      }),
      tx.query.basePacksTable.findFirst({
        where: eq(basePacksTable.id, toPackId),
      }),
    ]);

    if (!toPack) {
      throw new Error("Invalid pack");
    }

    if (currentPack === toPackId) {
      throw new Error("Cannot migrate to the same pack");
    }

    if (payment) {
      await tx
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
      await tx.insert(paymentsTable).values({
        connection: connectionId,
        currentPack,
        to: toPackId,
        type: "migration",
        lcoPrice: toPack.lcoPrice,
        customerPrice: toPack.customerPrice,
      });
    }
    await tx
      .update(connectionsTable)
      .set({ lastPayment: today.getTime(), basePack: toPackId })
      .where(eq(connectionsTable.id, connectionId));
  });
};

/**
 * This function deletes the given payment and updates the connection's lastPayment.
 *
 * @param {number} paymentId Id of the the payment to be deleted.
 * @param {number} connectionId Id of the connection that the payment belongs to
 */
export const deletePayment = async (
  paymentId: number,
  connectionId: number,
) => {
  await db.transaction(async (tx) => {
    await tx.delete(paymentsTable).where(eq(paymentsTable.id, paymentId));
    const lastPayment = await tx.query.paymentsTable.findFirst({
      where: eq(paymentsTable.connection, connectionId),
      orderBy: desc(paymentsTable.date),
    });
    await tx
      .update(connectionsTable)
      .set({ lastPayment: lastPayment?.date ?? null })
      .where(eq(connectionsTable.id, connectionId));
  });
};
