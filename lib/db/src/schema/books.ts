import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const booksTable = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  authorBio: text("author_bio").notNull().default(""),
  coverUrl: text("cover_url").notNull(),
  genre: text("genre").notNull(),
  tags: text("tags").array().notNull().default([]),
  rating: doublePrecision("rating").notNull().default(0),
  ratingsCount: integer("ratings_count").notNull().default(0),
  pages: integer("pages").notNull().default(0),
  year: integer("year").notNull().default(2024),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  trendingScore: integer("trending_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Book = typeof booksTable.$inferSelect;
