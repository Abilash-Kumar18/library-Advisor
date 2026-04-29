import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, libraryEntriesTable, booksTable } from "@workspace/db";
import {
  ListLibraryQueryParams,
  AddToLibraryBody,
  UpdateLibraryEntryBody,
  UpdateLibraryEntryParams,
  RemoveFromLibraryParams,
} from "@workspace/api-zod";
import { requireUser } from "../lib/auth";
import { libraryEntryToPublic, bookToPublic } from "../lib/serialize";
import type { User } from "@workspace/db";

const router: IRouter = Router();

router.get("/library", requireUser, async (req, res): Promise<void> => {
  const parsed = ListLibraryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const me = (req as typeof req & { user: User }).user;
  const filters = [eq(libraryEntriesTable.userId, me.id)];
  if (parsed.data.status) {
    filters.push(eq(libraryEntriesTable.status, parsed.data.status));
  }
  const rows = await db
    .select({
      entry: libraryEntriesTable,
      book: booksTable,
    })
    .from(libraryEntriesTable)
    .innerJoin(booksTable, eq(libraryEntriesTable.bookId, booksTable.id))
    .where(and(...filters))
    .orderBy(desc(libraryEntriesTable.addedAt));
  res.json(rows.map((r) => libraryEntryToPublic(r.entry, r.book)));
});

router.get("/library/stats", async (_req, res): Promise<void> => {
  const rows = await db.select().from(booksTable);
  const totalBooks = rows.length;
  let available = 0;
  let prebooked = 0;
  let issued = 0;
  for (const b of rows) {
    if (b.status === "prebooked") prebooked++;
    else if (b.status === "issued") issued++;
    else available++;
  }
  const recentlyPrebooked = rows
    .filter((b) => b.status === "prebooked")
    .slice(0, 6)
    .map(bookToPublic);
  res.json({ totalBooks, available, prebooked, issued, recentlyPrebooked });
});

router.get("/library/continue-reading", requireUser, async (req, res): Promise<void> => {
  const me = (req as typeof req & { user: User }).user;
  const rows = await db
    .select({ entry: libraryEntriesTable, book: booksTable })
    .from(libraryEntriesTable)
    .innerJoin(booksTable, eq(libraryEntriesTable.bookId, booksTable.id))
    .where(
      and(
        eq(libraryEntriesTable.userId, me.id),
        eq(libraryEntriesTable.status, "reading"),
      ),
    )
    .orderBy(desc(libraryEntriesTable.updatedAt))
    .limit(8);
  res.json(rows.map((r) => libraryEntryToPublic(r.entry, r.book)));
});

router.post("/library/entries", requireUser, async (req, res): Promise<void> => {
  const parsed = AddToLibraryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const me = (req as typeof req & { user: User }).user;
  const [book] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, parsed.data.bookId));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  const [entry] = await db
    .insert(libraryEntriesTable)
    .values({
      userId: me.id,
      bookId: parsed.data.bookId,
      status: parsed.data.status,
    })
    .onConflictDoUpdate({
      target: [libraryEntriesTable.userId, libraryEntriesTable.bookId],
      set: { status: parsed.data.status },
    })
    .returning();
  if (!entry) {
    res.status(500).json({ error: "Failed to add" });
    return;
  }
  res.json(libraryEntryToPublic(entry, book));
});

router.patch(
  "/library/entries/:bookId",
  requireUser,
  async (req, res): Promise<void> => {
    const params = UpdateLibraryEntryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateLibraryEntryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const me = (req as typeof req & { user: User }).user;
    const updates: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.progress !== undefined) updates.progress = parsed.data.progress;
    if (parsed.data.rating !== undefined) updates.rating = parsed.data.rating;

    const [entry] = await db
      .update(libraryEntriesTable)
      .set(updates)
      .where(
        and(
          eq(libraryEntriesTable.userId, me.id),
          eq(libraryEntriesTable.bookId, params.data.bookId),
        ),
      )
      .returning();
    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    const [book] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, entry.bookId));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json(libraryEntryToPublic(entry, book));
  },
);

router.delete(
  "/library/entries/:bookId",
  requireUser,
  async (req, res): Promise<void> => {
    const params = RemoveFromLibraryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const me = (req as typeof req & { user: User }).user;
    await db
      .delete(libraryEntriesTable)
      .where(
        and(
          eq(libraryEntriesTable.userId, me.id),
          eq(libraryEntriesTable.bookId, params.data.bookId),
        ),
      );
    res.json({ ok: true });
  },
);

export default router;
