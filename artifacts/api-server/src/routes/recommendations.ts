import { Router, type IRouter } from "express";
import { desc, eq, inArray, notInArray } from "drizzle-orm";
import { db, booksTable, libraryEntriesTable } from "@workspace/db";
import { GetRecommendationsQueryParams } from "@workspace/api-zod";
import { requireUser } from "../lib/auth";
import { bookToPublic } from "../lib/serialize";
import type { User, Book } from "@workspace/db";

const router: IRouter = Router();

function scoreBook(
  book: Book,
  user: User,
  model: "content" | "collaborative" | "hybrid",
): { score: number; reason: string } {
  let score = 50;
  const reasons: string[] = [];

  const genreMatch = user.favoriteGenres.includes(book.genre);
  const authorMatch = user.favoriteAuthors.some(
    (a) => a.toLowerCase() === book.author.toLowerCase(),
  );
  const styleAcademic = user.readingStyle === "academic";
  const styleFast = user.readingStyle === "fast_paced";

  if (model === "content" || model === "hybrid") {
    if (genreMatch) {
      score += 25;
      reasons.push(`you love ${book.genre.toLowerCase()}`);
    }
    if (authorMatch) {
      score += 18;
      reasons.push(`you've enjoyed ${book.author}`);
    }
    if (styleAcademic && book.pages > 350) {
      score += 6;
      reasons.push("matches your in-depth reading style");
    }
    if (styleFast && book.pages < 320) {
      score += 6;
      reasons.push("a quick, page-turning read");
    }
  }
  if (model === "collaborative" || model === "hybrid") {
    score += Math.round((book.rating - 3.5) * 10);
    if (book.trendingScore > 70) {
      score += 5;
      reasons.push("popular with readers like you");
    }
  }
  if (book.rating >= 4.4) {
    reasons.push(`highly rated at ${book.rating.toFixed(1)} stars`);
  }

  score = Math.max(40, Math.min(99, score));
  const reason = reasons.length
    ? `Recommended because ${reasons.slice(0, 2).join(" and ")}.`
    : `Picked for you based on overall fit.`;
  return { score, reason };
}

router.get("/recommendations", requireUser, async (req, res): Promise<void> => {
  const parsed = GetRecommendationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const me = (req as typeof req & { user: User }).user;
  const model = parsed.data.model ?? "hybrid";
  const limit = parsed.data.limit ?? 12;

  const owned = await db
    .select({ bookId: libraryEntriesTable.bookId })
    .from(libraryEntriesTable)
    .where(eq(libraryEntriesTable.userId, me.id));
  const ownedIds = owned.map((o) => o.bookId);

  const candidateQuery = db.select().from(booksTable);
  const all = ownedIds.length
    ? await candidateQuery.where(notInArray(booksTable.id, ownedIds))
    : await candidateQuery;

  const scored = all
    .map((b) => {
      const { score, reason } = scoreBook(b, me, model);
      return { book: b, score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  res.json(
    scored.map((s) => ({
      book: bookToPublic(s.book),
      matchPercent: s.score,
      reason: s.reason,
      model,
    })),
  );
});

router.get("/recommendations/based-on-interests", requireUser, async (req, res): Promise<void> => {
  const me = (req as typeof req & { user: User }).user;
  const genres = me.favoriteGenres;
  if (!genres.length) {
    const fallback = await db
      .select()
      .from(booksTable)
      .orderBy(desc(booksTable.rating))
      .limit(8);
    res.json(
      fallback.map((b) => ({
        book: bookToPublic(b),
        matchPercent: 70,
        reason: "Highly rated in our catalog.",
        model: "content",
      })),
    );
    return;
  }
  const rows = await db
    .select()
    .from(booksTable)
    .where(inArray(booksTable.genre, genres))
    .orderBy(desc(booksTable.rating))
    .limit(12);
  res.json(
    rows.map((b) => {
      const { score, reason } = scoreBook(b, me, "content");
      return {
        book: bookToPublic(b),
        matchPercent: score,
        reason,
        model: "content",
      };
    }),
  );
});

export default router;
