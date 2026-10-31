# Library Advisor

Library Advisor is a web application that helps readers discover books through AI-assisted recommendations, browse a book catalog, view book details, and manage a personal reading library. The project combines a React frontend with a Flask recommendation API powered by book metadata and machine-learning techniques.

## Problem

Readers often struggle to find relevant books because:

- Large catalogs make manual discovery difficult.
- Generic search does not always reflect a reader’s interests.
- Book information, recommendations, and reading progress are often spread across different platforms.
- Users need a simple way to organize books they are reading, have completed, or want to read.

## Solution

Library Advisor provides a centralized book-discovery experience with:

- AI-assisted book recommendations.
- Searchable and filterable book catalog.
- Genre discovery and book insights.
- Book detail pages with author, rating, category, and description information.
- Personal library management.
- Reading-status tracking such as `reading`, `read`, and `want_to_read`.
- User-facing pages for authentication, onboarding, dashboard, recommendations, library, and profile information.

The current recommendation engine uses book metadata such as title, authors, categories, descriptions, ratings, and publication information. It creates TF-IDF features using scikit-learn and exposes recommendation results through a Flask API.

## Features

- Landing page for introducing the application.
- Authentication interface.
- Reader onboarding flow.
- Personalized dashboard.
- Book recommendations.
- Book catalog browsing.
- Search by title or author.
- Filter books by genre and minimum rating.
- Book detail pages.
- Genre listing.
- Personal library interface.
- Reading progress and library status models.
- Profile and reading-insight pages.
- Health-check endpoint for deployment monitoring.
- Vercel-compatible API routing.

## Tech Stack

### Frontend

- TypeScript
- React 19
- Vite
- Tailwind CSS
- Wouter for client-side routing
- TanStack React Query for server-state management
- Radix UI components
- Framer Motion for animations
- React Hook Form
- Zod
- Lucide React icons
- pnpm workspaces

### Backend

- Python
- Flask
- Flask-CORS
- Pandas
- scikit-learn
- python-dotenv

### Recommendation System

- Pandas for loading and processing book data.
- `TfidfVectorizer` for converting book metadata into numerical features.
- Cosine similarity support for content-based recommendation workflows.
- CSV-based book catalog stored at `data_pipeline/raw_data/books.csv`.

### API and Tooling

- OpenAPI 3.1 specification.
- Orval-generated React API clients and Zod schemas.
- Vercel serverless deployment configuration.
- TypeScript project references for shared frontend libraries.

## Architecture

Library Advisor follows a multi-layer architecture:

```text
                    ┌──────────────────────────┐
                    │       React Frontend     │
                    │  Vite + TypeScript       │
                    │  Tailwind + Wouter       │
                    └─────────────┬────────────┘
                                  │ HTTP requests
                                  ▼
                    ┌──────────────────────────┐
                    │       Flask API          │
                    │  backend/main.py         │
                    │  Blueprint: recommend    │
                    └─────────────┬────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │    Recommender Service   │
                    │  backend/app/services/   │
                    │  recommender.py          │
                    └─────────────┬────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │       Book Dataset       │
                    │ data_pipeline/raw_data/  │
                    │ books.csv                │
                    └──────────────────────────┘
```

### Frontend Layer

The main frontend application is located in:

```text
frontend/artifacts/library-ai/
```

The application is bootstrapped by `src/main.tsx` and routed through `src/App.tsx`.

Available application routes include:

- `/`
- `/auth`
- `/onboarding`
- `/dashboard`
- `/recommendations`
- `/library`
- `/books/:id`
- `/profile`

The frontend uses `MainLayout` for application pages and includes reusable UI components such as book cards, layout components, navigation elements, and Radix-based UI primitives.

### API Layer

The Flask application is initialized in:

```text
backend/main.py
```

The recommendation blueprint is registered under the `/api` prefix:

```text
backend/app/api/recommend.py
```

The API currently exposes endpoints for:

- Health checks.
- Book recommendations.
- Book catalog browsing.
- Genre listing.
- Individual book lookup.
- Library responses.
- Library statistics.
- Current-user lookup.

The Vercel entry point is:

```text
api/index.py
```

It imports the Flask application from the backend and exposes it as a serverless function. The root `vercel.json` rewrites requests from `/api/*` to `/api/index.py`.

### Recommendation Layer

The main recommendation service is:

```text
backend/app/services/recommender.py
```

The `Recommender` class:

1. Loads `books.csv` with Pandas.
2. Fills missing values in important metadata columns.
3. Combines title, authors, categories, and description into a feature string.
4. Generates TF-IDF vectors.
5. Filters books by genre, search term, and minimum rating.
6. Converts dataset rows into API-compatible book objects.

The current recommendation response selects highly rated books and returns a generated match percentage and explanation. The service includes a foundation for content-based recommendations, while collaborative and hybrid recommendation modes are currently represented at the API level and can be expanded in future iterations.

### Data Pipeline

The data pipeline is located in:

```text
data_pipeline/
├── generate_model.py
├── train.py
└── raw_data/
    └── books.csv
```

`generate_model.py` contains the initial structure for model generation using Pandas, TF-IDF vectorization, and cosine similarity. `train.py` is currently reserved for future model-training logic.

## Project Structure

```text
.
├── api/
│   ├── index.py                  # Vercel Flask entry point
│   └── requirements.txt          # Python API dependencies
│
├── backend/
│   ├── main.py                   # Flask application
│   ├── app/
│   │   ├── api/
│   │   │   └── recommend.py      # Recommendation and catalog endpoints
│   │   └── services/
│   │       └── recommender.py    # Book recommendation service
│   ├── models/
│   │   └── book_recommendation_system.pkl
│   └── requirements.txt          # Backend dependencies
│
├── data_pipeline/
│   ├── generate_model.py         # Model-generation placeholder
│   ├── train.py                  # Training entry point
│   └── raw_data/
│       └── books.csv             # Book catalog dataset
│
├── frontend/
│   ├── artifacts/
│   │   ├── library-ai/           # Main React application
│   │   └── mockup-sandbox/       # Frontend sandbox
│   ├── lib/
│   │   ├── api-client-react/     # Generated React API client
│   │   ├── api-spec/             # OpenAPI specification
│   │   ├── api-zod/              # Generated Zod schemas
│   │   └── db/                   # Shared database package area
│   ├── scripts/                  # Frontend utility scripts
│   ├── package.json              # Workspace commands
│   └── pnpm-workspace.yaml       # pnpm workspace configuration
│
├── requirements.txt              # Root Python dependencies
└── vercel.json                   # Vercel API rewrite configuration
```

## API Endpoints

The API is available under the `/api` prefix.

### Health

```text
GET /api/healthz
```

### Recommendations

```text
GET /api/recommendations
GET /api/recommendations?model=hybrid&limit=12
```

Supported model labels include:

- `content`
- `collaborative`
- `hybrid`

### Books

```text
GET /api/books
GET /api/books?genre=Fantasy
GET /api/books?search=tolkien
GET /api/books?minRating=4
GET /api/books/:book_id
```

### Genres

```text
GET /api/insights/genres
```

### Library

```text
GET /api/library
GET /api/library/stats
```

## Getting Started

### Prerequisites

Install the following tools:

- Python 3.9 or later
- Node.js
- pnpm
- Git

### Clone the repository

```bash
git clone https://github.com/Abilash-Kumar18/library-Advisor.git
cd library-Advisor
```

### Run the Flask backend

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python backend/main.py
```

The Flask API runs on:

```text
http://localhost:5001
```

Health check:

```bash
curl http://localhost:5001/api/healthz
```

### Run the frontend

Open a second terminal and run:

```bash
cd frontend
pnpm install
pnpm --filter @workspace/library-ai run dev
```

The Vite development server will display the local frontend URL in the terminal.

### Run frontend type checking

```bash
cd frontend
pnpm run typecheck
```

### Build the frontend

```bash
cd frontend
pnpm run build
```

## Environment Variables

The current repository does not require a large set of mandatory environment variables for the basic local setup.

The Flask server supports the following optional variable:

```text
PORT
```

If `PORT` is not set, the backend defaults to port `5001`.

Example:

```bash
PORT=8000 python backend/main.py
```

## Deployment

The repository includes Vercel configuration for the Flask API:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```

The frontend also includes a Vercel configuration under:

```text
frontend/artifacts/library-ai/vercel.json
```

Before production deployment, verify that:

- The Python dependencies are installed in the deployment environment.
- `data_pipeline/raw_data/books.csv` is included in the deployment.
- The frontend API base URL points to the deployed backend.
- User authentication and library persistence are connected to a production database.
- Recommendation model training is implemented rather than using placeholder logic.

## Current Limitations and Future Improvements

The repository provides the foundation for a complete AI-powered library platform, but some capabilities are still under development:

- User authentication endpoints are currently represented in the API contract, while the Flask implementation returns a null current user.
- Library endpoints currently return empty or static responses.
- The recommendation service does not yet use user-specific history.
- Collaborative filtering is not implemented yet.
- Hybrid recommendations currently use the requested model label but do not combine multiple recommendation algorithms.
- The model-generation script is a placeholder.
- The training script is currently empty.
- A production database integration is still needed for users, sessions, books, and library entries.
- The generated OpenAPI client describes a broader API surface than the currently implemented Flask routes.

## Contributors

| Contributor | Contributions |
|---|---:|
| [Abilash-Kumar18](https://github.com/Abilash-Kumar18) | 3 |
| [DHARANIVIP](https://github.com/DHARANIVIP) | 2 |
| [replit-agent](https://github.com/replit-agent) | 1 |
| [dharshinibala025](https://github.com/dharshinibala025) | 1 |


