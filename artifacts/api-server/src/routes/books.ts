import { Router, type IRouter } from "express";
import { and, desc, eq, gte, ilike, or } from "drizzle-orm";
import { db, booksTable, libraryEntriesTable } from "@workspace/db";
import {
  ListBooksQueryParams,
  GetBookParams,
  UpdateBookStatusBody,
} from "@workspace/api-zod";
import { bookToPublic } from "../lib/serialize";
import { getCurrentUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/books", async (req, res): Promise<void> => {
  const parsed = ListBooksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { genre, author, minRating, search, limit } = parsed.data;
  const filters = [];
  if (genre) filters.push(eq(booksTable.genre, genre));
  if (author) filters.push(ilike(booksTable.author, `%${author}%`));
  if (typeof minRating === "number") filters.push(gte(booksTable.rating, minRating));
  if (search) {
    filters.push(
      or(
        ilike(booksTable.title, `%${search}%`),
        ilike(booksTable.author, `%${search}%`),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(booksTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(booksTable.rating))
    .limit(limit ?? 50);
  res.json(rows.map(bookToPublic));
});

router.get("/books/trending", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(booksTable)
    .orderBy(desc(booksTable.trendingScore))
    .limit(12);
  res.json(rows.map(bookToPublic));
});

router.get("/books/:bookId", async (req, res): Promise<void> => {
  const parsed = GetBookParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [book] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, parsed.data.bookId));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  const similar = await db
    .select()
    .from(booksTable)
    .where(and(eq(booksTable.genre, book.genre)))
    .orderBy(desc(booksTable.rating))
    .limit(6);
  const filteredSimilar = similar.filter((b) => b.id !== book.id).slice(0, 5);

  const me = await getCurrentUser(req);
  let inLibrary = false;
  let libraryStatus: string | null = null;
  let userRating: number | null = null;
  if (me) {
    const [entry] = await db
      .select()
      .from(libraryEntriesTable)
      .where(
        and(
          eq(libraryEntriesTable.userId, me.id),
          eq(libraryEntriesTable.bookId, book.id),
        ),
      );
    if (entry) {
      inLibrary = true;
      libraryStatus = entry.status;
      userRating = entry.rating ?? null;
    }
  }

  res.json({
    ...bookToPublic(book),
    description: book.description,
    authorBio: book.authorBio,
    similarBooks: filteredSimilar.map(bookToPublic),
    inLibrary,
    libraryStatus,
    userRating,
  });
});

router.patch("/books/:bookId/status", async (req, res): Promise<void> => {
  const params = GetBookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateBookStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [book] = await db
    .update(booksTable)
    .set({ status: body.data.status })
    .where(eq(booksTable.id, params.data.bookId))
    .returning();
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(bookToPublic(book));
});

export default router;
