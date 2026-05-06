import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'flashcards.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS study_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);

  CREATE TABLE IF NOT EXISTS dp_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    stage1_answer TEXT NOT NULL,
    stage2_answer TEXT NOT NULL,
    stage3_answer TEXT NOT NULL,
    source_file TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS dp_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL REFERENCES dp_problems(id) ON DELETE CASCADE,
    stage INTEGER NOT NULL CHECK (stage IN (1, 2, 3)),
    result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect')),
    attempted_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_dp_attempts_problem_stage ON dp_attempts(problem_id, stage);

  CREATE TABLE IF NOT EXISTS networking_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family TEXT NOT NULL,
    generator TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect')),
    attempted_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_networking_attempts_family ON networking_attempts(family, generator);

  CREATE TABLE IF NOT EXISTS exam_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_slug TEXT NOT NULL,
    source_file TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('tf', 'mc')),
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    UNIQUE (exam_slug, source_file, question_number)
  );

  CREATE INDEX IF NOT EXISTS idx_exam_questions_slug ON exam_questions(exam_slug);

  CREATE TABLE IF NOT EXISTS exam_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect')),
    attempted_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_exam_attempts_question ON exam_attempts(question_id);
`);

export default db;
