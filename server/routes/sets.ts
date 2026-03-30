import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const sets = db.prepare(`
    SELECT s.*, COUNT(c.id) as card_count
    FROM study_sets s
    LEFT JOIN cards c ON c.set_id = s.id
    GROUP BY s.id
    ORDER BY s.updated_at DESC
  `).all();
  res.json(sets);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare('INSERT INTO study_sets (name) VALUES (?)').run(name.trim());
  const set = db.prepare('SELECT * FROM study_sets WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(set);
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare(
    "UPDATE study_sets SET name = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(name.trim(), req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Set not found' });
    return;
  }
  const set = db.prepare('SELECT * FROM study_sets WHERE id = ?').get(req.params.id);
  res.json(set);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM study_sets WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Set not found' });
    return;
  }
  res.status(204).end();
});

export default router;
