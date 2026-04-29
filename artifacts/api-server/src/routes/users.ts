import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdatePreferencesBody } from "@workspace/api-zod";
import { requireUser, userToPublic } from "../lib/auth";
import type { User } from "@workspace/db";

const router: IRouter = Router();

router.put("/users/preferences", requireUser, async (req, res): Promise<void> => {
  const parsed = UpdatePreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const me = (req as typeof req & { user: User }).user;
  const [updated] = await db
    .update(usersTable)
    .set({
      favoriteGenres: parsed.data.favoriteGenres,
      favoriteAuthors: parsed.data.favoriteAuthors,
      readingStyle: parsed.data.readingStyle,
      onboarded: true,
    })
    .where(eq(usersTable.id, me.id))
    .returning();
  if (!updated) {
    res.status(500).json({ error: "Failed to update" });
    return;
  }
  res.json(userToPublic(updated));
});

export default router;
