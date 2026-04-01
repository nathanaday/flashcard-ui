# Flashcard UI

Supports any and all flashcard needs, but currently tailored for studying Dynamic Programming problems. 90 categorized problems are pre-seeded.

<img width="800" alt="Screenshot 2026-04-01 at 10 37 03 AM" src="https://github.com/user-attachments/assets/925c9c58-f45d-418c-bcd9-b504e84e1f51" />

<img width="800" alt="Screenshot 2026-04-01 at 10 37 09 AM" src="https://github.com/user-attachments/assets/429c3d2f-e550-462e-ac53-296ed30a26ae" />

<img width="800" alt="Screenshot 2026-04-01 at 10 37 17 AM" src="https://github.com/user-attachments/assets/1af78fc4-7196-4811-9368-f9c1dc470f79" />

<img width="800" alt="Screenshot 2026-04-01 at 10 37 23 AM" src="https://github.com/user-attachments/assets/09c23c7e-f15d-4665-9915-afde7b6c8088" />



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
