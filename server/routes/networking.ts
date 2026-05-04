import { Router } from 'express';
import { randomUUID } from 'crypto';
import db from '../db.js';
import {
  FAMILIES,
  familyList,
  generateForFamily,
  type NetworkingFamily,
} from '../networking/generators.js';

const router = Router();

function isFamily(value: string): value is NetworkingFamily {
  return value in FAMILIES;
}

interface StatsRow {
  tries: number;
  correct: number | null;
  latest_result: 'correct' | 'incorrect' | null;
}

const familyStatsStmt = db.prepare<[string, string], StatsRow>(`
  SELECT
    COUNT(*) as tries,
    SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct,
    (SELECT result FROM networking_attempts WHERE family = ? ORDER BY attempted_at DESC LIMIT 1) as latest_result
  FROM networking_attempts
  WHERE family = ?
`);

const generatorStatsStmt = db.prepare<[string, string, string, string], StatsRow>(`
  SELECT
    COUNT(*) as tries,
    SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct,
    (SELECT result FROM networking_attempts WHERE family = ? AND generator = ? ORDER BY attempted_at DESC LIMIT 1) as latest_result
  FROM networking_attempts
  WHERE family = ? AND generator = ?
`);

// GET /api/networking/families - list all 12 families with stats
router.get('/families', (_req, res) => {
  const out = familyList().map(family => {
    const def = FAMILIES[family];
    const agg = familyStatsStmt.get(family, family);
    const generators = def.generators.map(g => {
      const stats = generatorStatsStmt.get(family, g.slug, family, g.slug);
      return {
        slug: g.slug,
        label: g.label,
        tries: stats?.tries ?? 0,
        correct: stats?.correct ?? 0,
        latest_result: stats?.latest_result ?? null,
      };
    });
    return {
      family,
      label: def.label,
      description: def.description,
      tries: agg?.tries ?? 0,
      correct: agg?.correct ?? 0,
      latest_result: agg?.latest_result ?? null,
      generators,
    };
  });
  res.json(out);
});

// GET /api/networking/study/:family?count=10 - generate fresh problems
router.get('/study/:family', (req, res) => {
  const family = req.params.family;
  if (!isFamily(family)) {
    res.status(400).json({ error: `Unknown family: ${family}` });
    return;
  }
  const count = Math.max(1, Math.min(50, Number(req.query.count) || 10));
  const problems = generateForFamily(family, count).map(p => ({
    id: randomUUID(),
    ...p,
  }));
  res.json(problems);
});

// POST /api/networking/attempts - record a self-graded result
router.post('/attempts', (req, res) => {
  const { family, generator, result } = req.body ?? {};
  if (!family || !generator || !result) {
    res.status(400).json({ error: 'family, generator, and result are required' });
    return;
  }
  if (!isFamily(family)) {
    res.status(400).json({ error: `Unknown family: ${family}` });
    return;
  }
  if (!['correct', 'incorrect'].includes(result)) {
    res.status(400).json({ error: 'result must be correct or incorrect' });
    return;
  }
  const validGen = FAMILIES[family].generators.some(g => g.slug === generator);
  if (!validGen) {
    res.status(400).json({ error: `Unknown generator '${generator}' for family '${family}'` });
    return;
  }
  const inserted = db.prepare(
    'INSERT INTO networking_attempts (family, generator, result) VALUES (?, ?, ?)'
  ).run(family, generator, result);
  res.status(201).json({ id: inserted.lastInsertRowid });
});

export default router;
