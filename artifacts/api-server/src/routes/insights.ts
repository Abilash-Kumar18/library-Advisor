import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, booksTable, libraryEntriesTable } from "@workspace/db";
import { requireUser } from "../lib/auth";
import type { User } from "@workspace/db";

const router: IRouter = Router();

router.get("/insights/profile", requireUser, async (req, res): Promise<void> => {
  const me = (req as typeof req & { user: User }).user;

  const rows = await db
    .select({
      entry: libraryEntriesTable,
      book: booksTable,
    })
    .from(libraryEntriesTable)
    .innerJoin(booksTable, eq(libraryEntriesTable.bookId, booksTable.id))
    .where(eq(libraryEntriesTable.userId, me.id));

  const booksRead = rows.filter((r) => r.entry.status === "read").length;
  const currentlyReading = rows.filter((r) => r.entry.status === "reading").length;
  const wantToRead = rows.filter((r) => r.entry.status === "want_to_read").length;

  const readPages = rows
    .filter((r) => r.entry.status === "read")
    .reduce((acc, r) => acc + r.book.pages, 0);
  const inProgressPages = rows
    .filter((r) => r.entry.status === "reading")
    .reduce((acc, r) => acc + Math.round((r.book.pages * r.entry.progress) / 100), 0);
  const readingTimeHours = Math.max(0, Math.round((readPages + inProgressPages) / 50));

  const ratings = rows
    .map((r) => r.entry.rating)
    .filter((r): r is number => typeof r === "number");
  const averageRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : 0;

  const genreCount = new Map<string, number>();
  for (const r of rows) {
    genreCount.set(r.book.genre, (genreCount.get(r.book.genre) ?? 0) + 1);
  }
  const genreBreakdown = [...genreCount.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  const favoriteGenre =
    genreBreakdown[0]?.genre ?? me.favoriteGenres[0] ?? "Fiction";

  const styleLabel =
    me.readingStyle === "fast_paced"
      ? "fast-paced"
      : me.readingStyle === "academic"
        ? "deeply researched"
        : me.readingStyle === "casual"
          ? "easygoing"
          : "varied";

  const aiInsight = booksRead
    ? `You gravitate toward ${styleLabel} ${favoriteGenre.toLowerCase()} stories — your highest-rated picks share a quiet sense of momentum.`
    : `Once you log a few reads, your AI insight will sharpen. For now, we're tuning to your taste in ${favoriteGenre.toLowerCase()} and a ${styleLabel} pace.`;

  res.json({
    booksRead,
    currentlyReading,
    wantToRead,
    readingTimeHours,
    favoriteGenre,
    averageRating,
    aiInsight,
    genreBreakdown,
  });
});

router.get("/insights/genres", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ genre: booksTable.genre })
    .from(booksTable)
    .orderBy(sql`${booksTable.genre} asc`);
  res.json(rows.map((r) => r.genre));
});

export default router;
