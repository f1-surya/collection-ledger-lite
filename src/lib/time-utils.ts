import { format, parse } from "date-fns";

export const formatSqliteTimestamp = (timestamp: string) =>
  format(
    parse(timestamp, "yyyy-MM-dd HH:mm:ss", new Date()),
    "dd MMM yyyy : h:mm a",
  );
