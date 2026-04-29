import type { Book, LibraryEntry } from "@workspace/db";

export function bookToPublic(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    genre: book.genre,
    tags: book.tags,
    rating: book.rating,
    ratingsCount: book.ratingsCount,
    pages: book.pages,
    year: book.year,
    shortDescription: book.shortDescription,
  };
}

export function libraryEntryToPublic(entry: LibraryEntry, book: Book) {
  return {
    id: entry.id,
    bookId: entry.bookId,
    book: bookToPublic(book),
    status: entry.status as "reading" | "read" | "want_to_read",
    progress: entry.progress,
    rating: entry.rating ?? null,
    addedAt: entry.addedAt.toISOString(),
  };
}
