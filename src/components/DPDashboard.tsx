import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Info } from 'lucide-react';
import { useDPDashboard } from '../hooks/useDPDashboard.js';
import './DPDashboard.css';

const STAGE_NAMES = ['Recognize', 'Define OPT', 'Full Recurrence'];

function formatStat(latest: string | null, tries: number, correct: number): { text: string; status: 'pass' | 'fail' | 'untouched' } {
  if (tries === 0 || latest === null) {
    return { text: '—', status: 'untouched' };
  }
  const pct = Math.round((correct / tries) * 100);
  if (latest === 'correct') {
    return { text: `Pass (${pct}%, ${tries})`, status: 'pass' };
  }
  return { text: `Fail (${pct}%, ${tries})`, status: 'fail' };
}

export function DPDashboard() {
  const { problems, categories, loading, selectedCategory, setSelectedCategory } = useDPDashboard();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container dp-dashboard" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link
          to="/"
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
          All Study Sets
        </Link>
        <h1 className="page-title">Dynamic Programming</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 'var(--space-sm)' }}>
          {problems.length} problems across {categories.length} categories
        </p>
      </div>

      {/* Study Stage Buttons + Category Guide */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', alignItems: 'center' }}>
        {[1, 2, 3].map(stage => (
          <Link
            key={stage}
            to={`/dp/study/${stage}${selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}
          >
            <BookOpen size={16} />
            Stage {stage}: {STAGE_NAMES[stage - 1]}
          </Link>
        ))}
        <Link
          to="/dp/categories"
          className="btn-small"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}
        >
          <Info size={16} />
          Category Guide
        </Link>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap' }}>
        <button
          className={`chip ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
          style={{ padding: '0 16px' }}
        >
          All ({categories.reduce((sum, c) => sum + c.count, 0)})
        </button>
        {categories.map(cat => (
          <button
            key={cat.category}
            className={`chip ${selectedCategory === cat.category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
            style={{ padding: '0 16px' }}
          >
            {cat.category} ({cat.count})
          </button>
        ))}
      </div>

      {/* Stats Table */}
      {problems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-page) var(--space-2xl)', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            No DP problems imported yet
          </p>
          <p style={{ fontSize: '15px' }}>
            Run the import script to load problems from your DP repository.
          </p>
        </div>
      ) : (
        <div className="dp-table-wrapper">
          <table className="dp-table">
            <thead>
              <tr>
                <th className="dp-th-problem">Problem</th>
                <th className="dp-th-category">Category</th>
                <th className="dp-th-stage">Stage 1: Recognize</th>
                <th className="dp-th-stage">Stage 2: Define OPT</th>
                <th className="dp-th-stage">Stage 3: Recurrence</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(p => {
                const s1 = formatStat(p.stage1_latest, p.stage1_tries, p.stage1_correct);
                const s2 = formatStat(p.stage2_latest, p.stage2_tries, p.stage2_correct);
                const s3 = formatStat(p.stage3_latest, p.stage3_tries, p.stage3_correct);
                return (
                  <tr key={p.id}>
                    <td className="dp-td-problem">
                      <span className="dp-slug">{p.slug}</span>
                      <span className="dp-title">{p.title}</span>
                    </td>
                    <td className="dp-td-category">
                      <span className="dp-category-badge">{p.category}</span>
                    </td>
                    <td className={`dp-td-stage dp-stat-${s1.status}`}>{s1.text}</td>
                    <td className={`dp-td-stage dp-stat-${s2.status}`}>{s2.text}</td>
                    <td className={`dp-td-stage dp-stat-${s3.status}`}>{s3.text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
