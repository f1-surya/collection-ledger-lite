import { read, utils } from "xlsx";
import toast from "./toast";
import { db } from "@/db";
import { areasTable, basePacksTable, connectionsTable } from "@/db/schema";
import * as FileSystem from "expo-file-system";
import { openDatabaseSync } from "expo-sqlite";
import { askPermission, saveFile } from "./file-system";
import Share from "react-native-share";
import { getDocumentAsync } from "expo-document-picker";

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

    const allAreas: { [key: string]: number } = {};
    const basePacks: { [key: string]: number } = {};

    for (let i = 1; i < cleanData.length; i++) {
      const row = cleanData[i] as string[];

      // Check if currPack exists if not insert it into the db and use it's ID
      const currPack = row[5];
      if (!basePacks[currPack]) {
        const res = await db.insert(basePacksTable).values({
          name: currPack.toUpperCase(),
          lcoPrice: 90,
          customerPrice: 200,
        });
        basePacks[currPack] = res.lastInsertRowId;
      }

      // Check if the area exists or else insert it
      const currArea = row[2];
      if (!allAreas[currArea]) {
        const res = await db
          .insert(areasTable)
          .values({ name: currArea.toUpperCase() });
        allAreas[currArea] = res.lastInsertRowId;
      }
      await db.insert(connectionsTable).values({
        name: row[1].toUpperCase(),
        boxNumber: row[4].toUpperCase(),
        status: row[8] == "Active" ? "active" : "in-active",
        basePack: basePacks[currPack],
        area: allAreas[currArea],
      });
    }
  } catch (e) {
    console.error(e);
    toast("Something went wrong");
  }
}

export async function exportDb() {
  try {
    const dbPath = FileSystem.documentDirectory + "SQLite/db.db";
    const db = openDatabaseSync(dbPath);
    db.closeSync();
    const dbFile = await FileSystem.readAsStringAsync(dbPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    try {
      const destiny = await askPermission();
      if (!destiny.granted) {
        throw Error("Permission not granted");
      }
      await saveFile(
        "collection-ledger.db",
        dbFile,
        "application/octet-stream",
        destiny.directoryUri,
      );
    } catch (e) {
      console.error(e);
      Share.open({ url: dbPath });
    }
  } catch (e) {
    console.error(e);
    toast("Something went wrong");
  }
}

export async function importDb() {
  try {
    const res = await getDocumentAsync();
    if (!res.canceled) {
      const db = res.assets[0].uri;
      if (!db.includes("db")) {
        toast("Wrong file");
        return;
      }
      await FileSystem.copyAsync({
        from: db,
        to: FileSystem.documentDirectory + "SQLite/db.db",
      });
    }
  } catch (e) {
    console.error(e);
    toast("Something went wrong");
  }
}
