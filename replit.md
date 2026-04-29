# Library AI

## Overview

A modern web application that helps people discover their next favorite book using
AI-powered recommendations. Includes landing, authentication, onboarding, dashboard,
recommendations explorer, library, book details, and profile insights.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Frontend**: React + Vite + Tailwind + wouter (artifacts/library-ai)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Validation**: Zod, generated from OpenAPI
- **API codegen**: Orval (lib/api-spec → lib/api-client-react, lib/api-zod)

## Domain models

- `users` — profile, password hash, favorite genres/authors, reading style, onboarded flag
- `books` — catalog (title, author, cover, genre, tags, rating, trending score, descriptions)
- `library_entries` — user's saved books with status (reading/read/want_to_read), progress, rating
- `sessions` — server-side session ids, set as httpOnly cookie

## Key API surfaces

- `/api/auth/{signup,login,logout,me}` — cookie-based session auth
- `/api/users/preferences` — onboarding write
- `/api/books` (filters), `/api/books/trending`, `/api/books/:bookId`
- `/api/library`, `/api/library/continue-reading`, `/api/library/entries[/:bookId]`
- `/api/recommendations?model=hybrid|content|collaborative`
- `/api/recommendations/based-on-interests`
- `/api/insights/profile`, `/api/insights/genres`

## Key Commands

- `pnpm run typecheck`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate hooks/zod from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema
