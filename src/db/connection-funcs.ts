import { and, eq } from "drizzle-orm";
import { db } from ".";
import { basePacksTable, connectionsTable, paymentsTable } from "./schema";
import { toSqliteTimestamp } from "./columns.helpers";

export const markConnectionAsPaid = async (
  connectionId: number,
  currentPack: typeof basePacksTable.$inferSelect,
) => {
  const today = new Date();
  await Promise.all([
    db.insert(paymentsTable).values({
      connection: connectionId,
      currentPack: currentPack.id,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      lcoPrice: currentPack.lcoPrice,
      customerPrice: currentPack.customerPrice,
    }),
    db
      .update(connectionsTable)
      .set({
        lastPayment: toSqliteTimestamp(),
      })
      .where(eq(connectionsTable.id, connectionId)),
  ]);
};

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
        eq(paymentsTable.month, today.getMonth() + 1),
        eq(paymentsTable.year, today.getFullYear()),
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
        date: toSqliteTimestamp(),
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
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      date: toSqliteTimestamp(),
      lcoPrice: toPack.lcoPrice,
      customerPrice: toPack.customerPrice,
    });
  }
  await db
    .update(connectionsTable)
    .set({ lastPayment: toSqliteTimestamp(), basePack: toPackId })
    .where(eq(connectionsTable.id, connectionId));
};
