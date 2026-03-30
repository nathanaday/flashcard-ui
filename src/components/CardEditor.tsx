import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCards } from '../hooks/useCards.js';
import { ConfirmDialog } from './ConfirmDialog.js';
import type { Card } from '../types/index.js';

export function CardEditor() {
  const { id } = useParams<{ id: string }>();
  const setId = Number(id);
  const { cards, loading, addCard, updateCard, deleteCard } = useCards(setId);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState<Card | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  function resetForm() {
    setFront('');
    setBack('');
    setShowAdd(false);
    setEditing(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    await addCard(front.trim(), back.trim());
    setFront('');
    setBack('');
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !front.trim() || !back.trim()) return;
    await updateCard(editing.id, front.trim(), back.trim());
    resetForm();
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)' }}>
      <div style={{ marginBottom: 'var(--space-3xl)' }}>
        <Link
          to={`/sets/${setId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: 'var(--space-lg)',
          }}
        >
          <ArrowLeft size={16} />
          Back to study
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">Edit Cards</h1>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAdd(true); }}>
            <Plus size={18} />
            Add Card
          </button>
        </div>
      </div>

      {/* Add card form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--space-2xl)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Front
              </label>
              <textarea
                className="textarea"
                value={front}
                onChange={e => setFront(e.target.value)}
                placeholder="Question or term"
                autoFocus
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Back
              </label>
              <textarea
                className="textarea"
                value={back}
                onChange={e => setBack(e.target.value)}
                placeholder="Answer or definition"
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <button type="button" className="btn btn-secondary" style={{ height: '36px', padding: '0 16px' }} onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: '36px', padding: '0 16px' }} disabled={!front.trim() || !back.trim()}>
              Add
            </button>
          </div>
        </form>
      )}

      {/* Card list */}
      {cards.length === 0 && !showAdd ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-page) var(--space-2xl)',
          color: 'var(--color-text-secondary)',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No cards yet. Add your first card to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {cards.map(card => (
            <div
              key={card.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: 'var(--space-xl) var(--space-2xl)',
                transition: 'box-shadow var(--transition-base)',
              }}
            >
              {editing?.id === card.id ? (
                <form onSubmit={handleEdit}>
                  <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                    <textarea
                      className="textarea"
                      value={front}
                      onChange={e => setFront(e.target.value)}
                      autoFocus
                      style={{ flex: 1 }}
                    />
                    <textarea
                      className="textarea"
                      value={back}
                      onChange={e => setBack(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                    <button type="button" className="btn-icon" onClick={resetForm} aria-label="Cancel edit">
                      <X size={18} />
                    </button>
                    <button type="submit" className="btn-icon" style={{ color: 'var(--color-accent-green)' }} aria-label="Save edit" disabled={!front.trim() || !back.trim()}>
                      <Check size={18} />
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, display: 'flex', gap: 'var(--space-2xl)' }}>
                    <div style={{
                      flex: 1,
                      fontSize: '15px',
                      lineHeight: 1.55,
                      paddingRight: 'var(--space-2xl)',
                      borderRight: '1px solid var(--color-border)',
                    }}>
                      {card.front}
                    </div>
                    <div style={{ flex: 1, fontSize: '15px', lineHeight: 1.55 }}>
                      {card.back}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginLeft: 'var(--space-lg)', flexShrink: 0 }}>
                    <button
                      className="btn-icon"
                      aria-label="Edit card"
                      onClick={() => { setEditing(card); setFront(card.front); setBack(card.back); }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      aria-label="Delete card"
                      onClick={() => setDeleting(card)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Card"
          message="Are you sure you want to delete this card?"
          confirmLabel="Delete"
          danger
          onConfirm={async () => {
            await deleteCard(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
