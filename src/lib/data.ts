import { read, utils } from "xlsx";
import toast from "./toast";
import { db } from "@/db";
import { areasTable, basePacksTable, connectionsTable } from "@/db/schema";

export async function importFromSheet(base64: string) {
  try {
    const workbook = read(base64, { type: "base64" });
    const sheet = workbook.Sheets["Sheet1"];
    const jsonData = utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    // @ts-expect-error - Type wil be unknown
    const cleanData = jsonData.filter((row: string[]) =>
      row.some((cell) => cell !== ""),
    );

    let area: number;
    const allAreas = await db.select().from(areasTable);
    if (allAreas.length > 0) {
      area = allAreas[0].id;
    } else {
      const res = await db.insert(areasTable).values({ name: "Unknown" });
      area = res.lastInsertRowId;
    }

    const basePacks: { [key: string]: number } = {};
    for (let i = 1; i < cleanData.length; i++) {
      const row = cleanData[i] as string[];
      const currPack = row[5];
      if (!basePacks[currPack]) {
        const res = await db
          .insert(basePacksTable)
          .values({ name: currPack, lcoPrice: 90, customerPrice: 200 });
        basePacks[currPack] = res.lastInsertRowId;
      }
      await db.insert(connectionsTable).values({
        name: row[1],
        boxNumber: row[4],
        status: row[8] == "Active" ? "active" : "in-active",
        basePack: basePacks[currPack],
        area,
      });
    }
  } catch (e) {
    console.error(e);
    toast("Something went wrong");
  }
}
