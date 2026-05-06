import { Router } from 'express';
import db from '../db.js';

const router = Router();

interface QuestionRow {
  id: number;
  exam_slug: string;
  source_file: string;
  question_number: number;
  question_type: 'tf' | 'mc';
  question_text: string;
  answer: string;
  explanation: string;
  tries: number;
  correct: number;
  latest_result: 'correct' | 'incorrect' | null;
}

const dashboardStmt = db.prepare<[string]>(`
  SELECT
    q.id,
    q.exam_slug,
    q.source_file,
    q.question_number,
    q.question_type,
    q.question_text,
    q.answer,
    q.explanation,
    (SELECT COUNT(*) FROM exam_attempts WHERE question_id = q.id) as tries,
    (SELECT COUNT(*) FROM exam_attempts WHERE question_id = q.id AND result = 'correct') as correct,
    (SELECT result FROM exam_attempts WHERE question_id = q.id ORDER BY attempted_at DESC LIMIT 1) as latest_result
  FROM exam_questions q
  WHERE q.exam_slug = ?
  ORDER BY q.source_file ASC, q.question_number ASC
`);

router.get('/:slug/questions', (req, res) => {
  const rows = dashboardStmt.all(req.params.slug) as QuestionRow[];
  res.json(rows);
});

router.get('/:slug/study', (req, res) => {
  const source = (req.query.source as string | undefined) || null;
  const sql = source
    ? `SELECT id, exam_slug, source_file, question_number, question_type, question_text, answer, explanation
       FROM exam_questions WHERE exam_slug = ? AND source_file = ? ORDER BY RANDOM()`
    : `SELECT id, exam_slug, source_file, question_number, question_type, question_text, answer, explanation
       FROM exam_questions WHERE exam_slug = ? ORDER BY RANDOM()`;
  const params = source ? [req.params.slug, source] : [req.params.slug];
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.post('/attempts', (req, res) => {
  const { question_id, result } = req.body ?? {};
  if (!question_id || !result) {
    res.status(400).json({ error: 'question_id and result are required' });
    return;
  }
  if (!['correct', 'incorrect'].includes(result)) {
    res.status(400).json({ error: 'result must be correct or incorrect' });
    return;
  }
  const exists = db.prepare('SELECT id FROM exam_questions WHERE id = ?').get(question_id);
  if (!exists) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }
  const inserted = db.prepare(
    'INSERT INTO exam_attempts (question_id, result) VALUES (?, ?)'
  ).run(question_id, result);
  res.status(201).json({ id: inserted.lastInsertRowid });
});

export default router;
