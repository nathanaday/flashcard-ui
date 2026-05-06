import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

interface ParsedQuestion {
  number: number;
  question_type: 'tf' | 'mc';
  question_text: string;
  answer: string;
  explanation: string;
}

const HEADER_RE = /^###\s+(\d+)\s*$/;
const ANSWER_RE = /^\*\*Answer:\s*(.+?)\*\*\s*$/;

function parseSection(number: number, lines: string[]): ParsedQuestion | null {
  const blockquoteLines: string[] = [];
  let answer: string | null = null;
  let answerIdx = -1;
  let inBlockquote = false;
  let pastBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    if (trimmed.startsWith('>')) {
      if (pastBlockquote) break;
      inBlockquote = true;
      blockquoteLines.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }

    if (inBlockquote && trimmed === '') {
      pastBlockquote = true;
      continue;
    }

    const m = trimmed.match(ANSWER_RE);
    if (m) {
      answer = m[1].trim();
      answerIdx = i;
      break;
    }
  }

  if (answer === null || answerIdx === -1) return null;

  const question_text = blockquoteLines.join('\n').trim();
  if (!question_text) return null;

  const explanation = lines.slice(answerIdx + 1).join('\n').trim();
  const question_type: 'tf' | 'mc' = /^[a-z]\.\s/m.test(question_text) ? 'mc' : 'tf';

  return { number, question_type, question_text, answer, explanation };
}

function parseFile(filePath: string): ParsedQuestion[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const questions: ParsedQuestion[] = [];

  let currentNumber: number | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentNumber !== null) {
      const parsed = parseSection(currentNumber, currentLines);
      if (parsed) questions.push(parsed);
    }
  };

  for (const line of lines) {
    const m = line.match(HEADER_RE);
    if (m) {
      flush();
      currentNumber = parseInt(m[1], 10);
      currentLines = [];
    } else if (currentNumber !== null) {
      currentLines.push(line);
    }
  }
  flush();

  return questions;
}

const upsertStmt = db.prepare(`
  INSERT INTO exam_questions
    (exam_slug, source_file, question_number, question_type, question_text, answer, explanation)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(exam_slug, source_file, question_number) DO UPDATE SET
    question_type = excluded.question_type,
    question_text = excluded.question_text,
    answer = excluded.answer,
    explanation = excluded.explanation
`);

interface ImportSummary {
  exam_slug: string;
  source_file: string;
  questions: number;
}

export function importExamsFromContentDir(contentDir: string): ImportSummary[] {
  if (!fs.existsSync(contentDir)) return [];
  const summaries: ImportSummary[] = [];

  const slugs = fs.readdirSync(contentDir).filter(name => {
    const full = path.join(contentDir, name);
    return fs.statSync(full).isDirectory() && !name.startsWith('.');
  });

  for (const slug of slugs) {
    const slugDir = path.join(contentDir, slug);
    const files = fs.readdirSync(slugDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const fullPath = path.join(slugDir, file);
      const questions = parseFile(fullPath);
      if (questions.length === 0) continue;

      const tx = db.transaction((items: ParsedQuestion[]) => {
        for (const q of items) {
          upsertStmt.run(
            slug,
            file,
            q.number,
            q.question_type,
            q.question_text,
            q.answer,
            q.explanation,
          );
        }
      });
      tx(questions);

      summaries.push({ exam_slug: slug, source_file: file, questions: questions.length });
    }
  }

  return summaries;
}

const isMain = (() => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    return process.argv[1] === __filename;
  } catch {
    return false;
  }
})();

if (isMain) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dir = process.argv[2] || path.join(__dirname, '..', 'content');
  const summaries = importExamsFromContentDir(dir);
  if (summaries.length === 0) {
    console.log(`No exam markdown files found under ${dir}`);
  } else {
    for (const s of summaries) {
      console.log(`${s.exam_slug}/${s.source_file}: ${s.questions} questions`);
    }
  }
}
