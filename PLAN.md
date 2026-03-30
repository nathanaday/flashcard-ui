# DP Study Mode — Implementation Plan

## Overview

Add a dedicated "Dynamic Programming" study mode to the existing flashcard app. DP problems are imported from the markdown repo and studied in 3 progressive stages. Stats are persisted per-problem per-stage.

---

## 1. New Database Tables

### `dp_problems`
Stores each DP problem as a single record with pre-parsed stage content.

```sql
CREATE TABLE dp_problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,          -- e.g. "LC-70", "HW-06-03"
  title TEXT NOT NULL,                -- e.g. "Climbing Stairs"
  description TEXT NOT NULL,          -- problem statement (markdown, everything before ---)
  category TEXT NOT NULL,             -- e.g. "Warmup", "Grid DP"
  stage1_answer TEXT NOT NULL,        -- category name (the "recognize it" answer)
  stage2_answer TEXT NOT NULL,        -- sections A + B (plain-english OPT definition)
  stage3_answer TEXT NOT NULL,        -- sections C + D + E (recurrence, base cases, complexity)
  source_file TEXT NOT NULL,          -- original filename for re-import tracking
  created_at TEXT DEFAULT (datetime('now'))
);
```

### `dp_attempts`
Stores every attempt for stats. One row per problem × stage × attempt.

```sql
CREATE TABLE dp_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL REFERENCES dp_problems(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL CHECK (stage IN (1, 2, 3)),
  result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect')),
  attempted_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_dp_attempts_problem_stage ON dp_attempts(problem_id, stage);
```

**Stats are derived from `dp_attempts` via queries:**
- Most recent result: `ORDER BY attempted_at DESC LIMIT 1`
- Pass rate: `COUNT(correct) / COUNT(*)`
- Total tries: `COUNT(*)`
- Display format: **"Pass (75%, 8 tries)"** or **"Fail (11%, 33 tries)"** or **"—"** (untouched)

---

## 2. Backend — New API Routes

### `server/routes/dp.ts`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/dp/problems` | List all problems with computed stats for all 3 stages |
| `GET` | `/api/dp/problems/:id` | Get single problem with full content |
| `GET` | `/api/dp/study/:stage` | Get all problems for a study session (shuffled), returns only `id`, `slug`, `title`, `description` + the relevant stage answer |
| `POST` | `/api/dp/attempts` | Record an attempt `{ problem_id, stage, result }` |
| `POST` | `/api/dp/import` | Trigger re-import from markdown directory |
| `GET` | `/api/dp/categories` | List distinct categories with problem counts |

**Stats query (for the dashboard):**
```sql
SELECT
  p.*,
  -- For each stage, compute: latest result, total attempts, correct count
  (SELECT result FROM dp_attempts WHERE problem_id = p.id AND stage = 1
   ORDER BY attempted_at DESC LIMIT 1) as stage1_latest,
  (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 1) as stage1_tries,
  (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 1
   AND result = 'correct') as stage1_correct,
  -- ... same for stage 2, 3
```

---

## 3. Import Script

### `server/import-dp.ts`

Parses markdown files from the DP repo directory and upserts into `dp_problems`.

**Parsing logic per file:**
1. **Description:** Everything from the start of the file up to the first `---`
2. **Category:** Extract from `**Category:** [[Categories/X-Name]]` line → strip to readable name (e.g. "Grid DP", "Knapsack")
3. **Stage 1 answer:** The category name
4. **Stage 2 answer:** Content under `### A.` and `### B.` headers
5. **Stage 3 answer:** Content under `### C.`, `### D.`, and `### E.` headers
6. **Title:** First `##` or `#` heading, or derive from slug
7. **Slug:** Filename without `.md` extension

**Image handling:** Obsidian `![[image.png]]` references are preserved as-is in the markdown. The frontend renderer will handle displaying them (or show a placeholder if unavailable).

**Upsert behavior:** Match on `slug`. If exists, update content. If new, insert. This makes the import re-runnable as problems are added/edited.

**Invocation:**
- CLI: `npx tsx server/import-dp.ts /path/to/dp-repo`
- API: `POST /api/dp/import` with `{ directory: "/path/to/dp-repo" }`

---

## 4. Frontend — New Routes & Components

### New Routes (add to App.tsx)
```
/dp                → DPDashboard (stats table overview)
/dp/study/:stage   → DPStudySession (flashcard study for a specific stage)
```

### Navigation Update
Add a tab/toggle to `SetList` (home page) that switches between "Your Study Sets" and "DP Problems" — or add a persistent nav bar with two sections.

### New Components

#### `DPDashboard.tsx` — The Stats Table
The heart of the blind-spot tracker. A full-width table showing:

| Problem | Category | Stage 1: Recognize | Stage 2: Define OPT | Stage 3: Full Recurrence |
|---------|----------|--------------------|---------------------|--------------------------|
| LC-70 Climbing Stairs | Warmup | **Pass** (75%, 8) | **Pass** (50%, 4) | — |
| HW-06-03 Alice & Bob | Interval DP | **Fail** (33%, 6) | — | — |

**Features:**
- Color-coded cells: green for latest-pass, red for latest-fail, gray for untouched
- The most recent result is bold/prominent, with the ratio and tries in smaller text
- Sortable by column (problem name, category, any stage's pass rate)
- Filterable by category (dropdown)
- "Study Stage X" buttons at the top that link to `/dp/study/1`, `/dp/study/2`, `/dp/study/3`
- Optional: filter to show only "failing" or "untouched" problems for focused review

#### `DPStudySession.tsx` — Stage-Specific Study
Reuses the existing flashcard UX pattern but adapted for DP:

- **Front of card:** Problem description (rendered as markdown with LaTeX)
- **Back of card (depends on stage):**
  - Stage 1: The category (e.g. "Interval DP")
  - Stage 2: Sections A + B (identify variables, define OPT)
  - Stage 3: Sections C + D + E (base cases, recurrence, complexity)
- Self-graded: after flipping, user clicks "Got it" or "Still learning" (same as existing)
- Each grade posts to `POST /api/dp/attempts`
- Cards are shuffled at session start
- Session completion shows summary, then links back to dashboard

#### `DPFlashcard.tsx` — Enhanced Flashcard with Markdown/LaTeX
Extends the existing `Flashcard` component:

- Renders content as **markdown** (headers, bold, lists, code blocks)
- Renders **LaTeX** inline (`$...$`) and display (`$$...$$`) math
- Supports `\boxed{}`, `\begin{cases}`, and other LaTeX constructs used in the repo
- Same 3D flip animation, same keyboard shortcuts

**Library choice:** `react-markdown` + `remark-math` + `rehype-katex` (or `react-katex`). KaTeX is faster than MathJax and well-suited for this use case.

#### `DPCategoryFilter.tsx` — Category Filter Chips
Row of clickable category chips (reusing existing `.chip` CSS class) to filter the dashboard table or filter which problems appear in a study session.

---

## 5. Styling

All new components use the existing CSS variable system (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`). No new design system.

**New CSS additions:**
- `.dp-dashboard` table styles (clean, compact rows)
- `.dp-stat-cell` styles (color-coded pass/fail/untouched badges)
- `.markdown-content` styles (for rendered markdown inside flashcards — headings, lists, code, etc.)
- KaTeX stylesheet import (CDN or bundled)

---

## 6. Dependencies to Add

```
npm install react-markdown remark-math rehype-katex katex
```

- `react-markdown` — renders markdown to React components
- `remark-math` — parses `$...$` and `$$...$$` in markdown
- `rehype-katex` — renders math nodes using KaTeX
- `katex` — the KaTeX CSS stylesheet

---

## 7. Implementation Order

| Step | What | Files Touched |
|------|------|---------------|
| **1** | Add DB tables + import script | `server/db.ts`, new `server/import-dp.ts` |
| **2** | Run import against DP repo, validate data | CLI invocation |
| **3** | Add backend API routes | new `server/routes/dp.ts`, `server/index.ts` |
| **4** | Install frontend deps (react-markdown, katex) | `package.json` |
| **5** | Build `DPFlashcard` with markdown/LaTeX rendering | new `src/components/DPFlashcard.tsx` + CSS |
| **6** | Build `DPStudySession` (stage-specific study flow) | new `src/components/DPStudySession.tsx`, new `src/hooks/useDPStudy.ts` |
| **7** | Build `DPDashboard` (stats table) | new `src/components/DPDashboard.tsx` + CSS |
| **8** | Add routes + navigation | `src/App.tsx`, update `SetList.tsx` or add nav bar |
| **9** | Test end-to-end: import → study → stats | Manual QA |

---

## 8. What Stays the Same

- Existing study sets and generic flashcard functionality — untouched
- Existing database tables (`study_sets`, `cards`) — untouched
- All existing components — untouched (DPFlashcard is a new component that wraps/extends Flashcard's visual style but doesn't modify the original)
- Dev/build workflow — same `npm run dev:all`

---

## 9. File Summary

**New files:**
```
server/import-dp.ts              # Markdown parser + DB importer
server/routes/dp.ts              # All DP API endpoints
src/components/DPDashboard.tsx    # Stats table view
src/components/DPDashboard.css    # Dashboard styles
src/components/DPStudySession.tsx # Stage-specific study flow
src/components/DPFlashcard.tsx    # Markdown/LaTeX flashcard
src/components/DPFlashcard.css    # Flashcard markdown styles
src/hooks/useDPStudy.ts          # Study session state + API calls
src/hooks/useDPDashboard.ts      # Dashboard data fetching + filtering
src/types/dp.ts                  # DP-specific TypeScript interfaces
```

**Modified files:**
```
server/db.ts                     # Add dp_problems + dp_attempts tables
server/index.ts                  # Mount dp routes
src/App.tsx                      # Add /dp routes
src/index.css                    # Add nav bar styles + markdown content styles
src/components/SetList.tsx       # Add navigation link to DP mode
package.json                     # Add react-markdown, katex deps
```
