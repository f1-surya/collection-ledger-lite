import { format } from "date-fns";
import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const timestamps = {
  updated_at: text().default(sql`(CURRENT_TIMESTAMP)`),
  created_at: text().default(sql`(CURRENT_DATE)`),
};

export const toSqliteTimestamp = (date = new Date()) =>
  format(date, "yyyy-MM-dd HH:mm:ss");
