import { utils, write } from "xlsx";

export function writeSheet(data: { [key: string]: string[][] }) {
  const workbook = utils.book_new();

  for (const key in data) {
    const sheet = utils.aoa_to_sheet(data[key]);

    // Set column widths
    const range = utils.decode_range(sheet["!ref"] || "A1");
    const colWidths = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      colWidths.push({ wch: 18 });
    }
    sheet["!cols"] = colWidths;

    utils.book_append_sheet(workbook, sheet, key);
  }

  return write(workbook, { type: "base64", bookType: "xlsx" });
}
