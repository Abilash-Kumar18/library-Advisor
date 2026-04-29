import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const libraryEntriesTable = pgTable(
  "library_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => booksTable.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("want_to_read"),
    progress: integer("progress").notNull().default(0),
    rating: doublePrecision("rating"),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userBookUnique: unique().on(t.userId, t.bookId),
  }),
);

export type LibraryEntry = typeof libraryEntriesTable.$inferSelect;
