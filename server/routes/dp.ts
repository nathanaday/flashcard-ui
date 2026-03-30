import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/dp/problems - list all problems with stats for all 3 stages
router.get('/problems', (_req, res) => {
  const problems = db.prepare(`
    SELECT
      p.*,
      (SELECT result FROM dp_attempts WHERE problem_id = p.id AND stage = 1 ORDER BY attempted_at DESC LIMIT 1) as stage1_latest,
      (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 1) as stage1_tries,
      (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 1 AND result = 'correct') as stage1_correct,
      (SELECT result FROM dp_attempts WHERE problem_id = p.id AND stage = 2 ORDER BY attempted_at DESC LIMIT 1) as stage2_latest,
      (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 2) as stage2_tries,
      (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 2 AND result = 'correct') as stage2_correct,
      (SELECT result FROM dp_attempts WHERE problem_id = p.id AND stage = 3 ORDER BY attempted_at DESC LIMIT 1) as stage3_latest,
      (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 3) as stage3_tries,
      (SELECT COUNT(*) FROM dp_attempts WHERE problem_id = p.id AND stage = 3 AND result = 'correct') as stage3_correct
    FROM dp_problems p
    ORDER BY p.slug ASC
  `).all();
  res.json(problems);
});

// GET /api/dp/problems/:id - single problem with full content
router.get('/problems/:id', (req, res) => {
  const problem = db.prepare('SELECT * FROM dp_problems WHERE id = ?').get(req.params.id);
  if (!problem) {
    res.status(404).json({ error: 'Problem not found' });
    return;
  }
  res.json(problem);
});

// GET /api/dp/study/:stage - get problems for study session
// Optional query param: ?category=Basic 1D to filter
router.get('/study/:stage', (req, res) => {
  const stage = Number(req.params.stage);
  if (![1, 2, 3].includes(stage)) {
    res.status(400).json({ error: 'Stage must be 1, 2, or 3' });
    return;
  }

  const category = req.query.category as string | undefined;

  let query = 'SELECT id, slug, title, description, category';
  if (stage === 1) query += ', stage1_answer as answer';
  else if (stage === 2) query += ', stage2_answer as answer';
  else query += ', stage3_answer as answer';
  query += ' FROM dp_problems';

  const params: string[] = [];
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY RANDOM()';

  const problems = db.prepare(query).all(...params);
  res.json(problems);
});

// POST /api/dp/attempts - record an attempt
router.post('/attempts', (req, res) => {
  const { problem_id, stage, result } = req.body;

  if (!problem_id || !stage || !result) {
    res.status(400).json({ error: 'problem_id, stage, and result are required' });
    return;
  }
  if (![1, 2, 3].includes(stage)) {
    res.status(400).json({ error: 'Stage must be 1, 2, or 3' });
    return;
  }
  if (!['correct', 'incorrect'].includes(result)) {
    res.status(400).json({ error: 'Result must be correct or incorrect' });
    return;
  }

  const problemExists = db.prepare('SELECT id FROM dp_problems WHERE id = ?').get(problem_id);
  if (!problemExists) {
    res.status(404).json({ error: 'Problem not found' });
    return;
  }

  const inserted = db.prepare(
    'INSERT INTO dp_attempts (problem_id, stage, result) VALUES (?, ?, ?)'
  ).run(problem_id, stage, result);

  res.status(201).json({ id: inserted.lastInsertRowid });
});

// GET /api/dp/categories - list distinct categories with counts
router.get('/categories', (_req, res) => {
  const categories = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM dp_problems
    GROUP BY category
    ORDER BY category ASC
  `).all();
  res.json(categories);
});

// POST /api/dp/seed - bulk import from JSON array
router.post('/seed', (req, res) => {
  const problems = req.body;
  if (!Array.isArray(problems)) {
    res.status(400).json({ error: 'Expected an array of problems' });
    return;
  }

  const upsert = db.prepare(`
    INSERT INTO dp_problems (slug, title, description, category, stage1_answer, stage2_answer, stage3_answer, source_file)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      stage1_answer = excluded.stage1_answer,
      stage2_answer = excluded.stage2_answer,
      stage3_answer = excluded.stage3_answer,
      source_file = excluded.source_file
  `);

  const insertMany = db.transaction((items: typeof problems) => {
    let count = 0;
    for (const p of items) {
      upsert.run(p.slug, p.title, p.description, p.category, p.stage1_answer, p.stage2_answer, p.stage3_answer, p.source_file);
      count++;
    }
    return count;
  });

  const count = insertMany(problems);
  res.json({ imported: count });
});

export default router;
