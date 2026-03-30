import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Layers, Brain } from 'lucide-react';
import { useSets } from '../hooks/useSets.js';
import { CreateSetDialog } from './CreateSetDialog.js';
import { ConfirmDialog } from './ConfirmDialog.js';
import type { StudySet } from '../types/index.js';

export function SetList() {
  const { sets, loading, createSet, renameSet, deleteSet } = useSets();
  const [showCreate, setShowCreate] = useState(false);
  const [renaming, setRenaming] = useState<StudySet | null>(null);
  const [deleting, setDeleting] = useState<StudySet | null>(null);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-4xl)', paddingBottom: 'var(--space-4xl)' }}>
      {/* DP Study Mode Banner */}
      <Link
        to="/dp"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xl)',
          background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl) var(--space-2xl)',
          marginBottom: 'var(--space-3xl)',
          boxShadow: 'var(--shadow-flashcard)',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-base)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-flashcard)';
        }}
      >
        <Brain size={32} />
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '2px' }}>Dynamic Programming</div>
          <div style={{ fontSize: '14px', opacity: 0.85 }}>3-stage study system with progress tracking</div>
        </div>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3xl)' }}>
        <h1 className="page-title">Your Study Sets</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} />
          Create Set
        </button>
      </div>

      {sets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-page) var(--space-2xl)',
          color: 'var(--color-text-secondary)',
        }}>
          <Layers size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }} />
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            No study sets yet
          </p>
          <p style={{ fontSize: '15px' }}>Create your first study set to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {sets.map(set => (
            <div
              key={set.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: 'var(--space-xl) var(--space-2xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'box-shadow var(--transition-base)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-hover)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
            >
              <Link
                to={`/sets/${set.id}`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}
              >
                <span style={{ fontSize: '17px', fontWeight: 600 }}>{set.name}</span>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  {set.card_count} {set.card_count === 1 ? 'card' : 'cards'}
                </span>
              </Link>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button
                  className="btn-icon"
                  aria-label={`Rename ${set.name}`}
                  onClick={() => setRenaming(set)}
                >
                  <Pencil size={18} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  aria-label={`Delete ${set.name}`}
                  onClick={() => setDeleting(set)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSetDialog
          title="Create Study Set"
          onSubmit={async (name) => {
            await createSet(name);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {renaming && (
        <CreateSetDialog
          title="Rename Study Set"
          initialName={renaming.name}
          onSubmit={async (name) => {
            await renameSet(renaming.id, name);
            setRenaming(null);
          }}
          onCancel={() => setRenaming(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Study Set"
          message={`Are you sure you want to delete "${deleting.name}"? All cards in this set will be permanently removed.`}
          confirmLabel="Delete"
          danger
          onConfirm={async () => {
            await deleteSet(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
