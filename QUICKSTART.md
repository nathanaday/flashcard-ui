# Quickstart

## Prerequisites

- Node.js >= 18 (v20+ recommended)
- npm

## Running locally

Install dependencies and start both the frontend (Vite on port 5173) and backend (Express on port 3001):

```bash
npm install
npm run dev:all
```

The app will be available at `http://localhost:5173`.

## Seeding DP problems

With the dev server running, seed the database with the bundled dynamic programming problems:

```bash
npm run seed:dp
```

This loads `dp-problems.json` into the SQLite database via the `POST /api/dp/seed` endpoint. The file contains ~160 problems across multiple DP categories, each with three study stages.
