import os
import sys
from pathlib import Path
from typing import List

from .book_recommendation import save_books_pickle, load_books_pickle


def clean_models_dir(keep_files: List[str]):
    root = Path(__file__).resolve().parent
    removed = []
    for p in root.iterdir():
        if p.name in keep_files:
            continue
        # only remove files (not directories) for safety
        try:
            if p.is_file():
                p.unlink()
                removed.append(p.name)
        except Exception:
            pass
    return removed


def main():
    root = Path(__file__).resolve().parent
    pkl_name = "book_recommendation.pkl"
    pkl_path = root / pkl_name

    # ensure the pickle exists (create default if missing)
    if not pkl_path.exists():
        save_books_pickle(path=str(pkl_path))

    # remove everything except the pickle
    removed = clean_models_dir(keep_files=[pkl_name, "__init__.py"])

    # show resulting files
    remaining = [p.name for p in root.iterdir() if p.is_file()]
    print("Removed files:", removed)
    print("Remaining files:", remaining)

    # load and pretty-print the pickle contents
    books = load_books_pickle(path=str(pkl_path))
    print("\nContents of book_recommendation.pkl:")
    for i, b in enumerate(books, 1):
        title = b.get("title") if isinstance(b, dict) else str(b)
        desc = b.get("description") if isinstance(b, dict) else ""
        print(f"{i}. {title} — {desc}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Error:", e, file=sys.stderr)
        sys.exit(1)
