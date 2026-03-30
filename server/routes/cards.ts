import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/sets/:setId/cards', (req, res) => {
  const cards = db.prepare(
    'SELECT * FROM cards WHERE set_id = ? ORDER BY position ASC, id ASC'
  ).all(req.params.setId);
  res.json(cards);
});

router.post('/sets/:setId/cards', (req, res) => {
  const { front, back } = req.body;
  if (!front || !back || typeof front !== 'string' || typeof back !== 'string') {
    res.status(400).json({ error: 'Front and back are required' });
    return;
  }

  const setExists = db.prepare('SELECT id FROM study_sets WHERE id = ?').get(req.params.setId);
  if (!setExists) {
    res.status(404).json({ error: 'Set not found' });
    return;
  }

  const maxPos = db.prepare(
    'SELECT COALESCE(MAX(position), -1) as max_pos FROM cards WHERE set_id = ?'
  ).get(req.params.setId) as { max_pos: number };

  const result = db.prepare(
    'INSERT INTO cards (set_id, front, back, position) VALUES (?, ?, ?, ?)'
  ).run(req.params.setId, front.trim(), back.trim(), maxPos.max_pos + 1);

  db.prepare("UPDATE study_sets SET updated_at = datetime('now') WHERE id = ?").run(req.params.setId);

  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(card);
});

router.put('/cards/:id', (req, res) => {
  const { front, back } = req.body;
  if (!front || !back || typeof front !== 'string' || typeof back !== 'string') {
    res.status(400).json({ error: 'Front and back are required' });
    return;
  }
  const result = db.prepare(
    'UPDATE cards SET front = ?, back = ? WHERE id = ?'
  ).run(front.trim(), back.trim(), req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);

  if (card && typeof card === 'object' && 'set_id' in card) {
    db.prepare("UPDATE study_sets SET updated_at = datetime('now') WHERE id = ?").run(
      (card as { set_id: number }).set_id
    );
  }

  res.json(card);
});

router.delete('/cards/:id', (req, res) => {
  const card = db.prepare('SELECT set_id FROM cards WHERE id = ?').get(req.params.id) as { set_id: number } | undefined;
  const result = db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  if (card) {
    db.prepare("UPDATE study_sets SET updated_at = datetime('now') WHERE id = ?").run(card.set_id);
  }
  res.status(204).end();
});

export default router;
