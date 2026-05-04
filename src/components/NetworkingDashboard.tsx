import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { api } from '../api/client.js';
import type { FamilyStats, AttemptResult } from '../types/networking.js';
import './DPDashboard.css';

function formatStat(latest: AttemptResult | null, tries: number, correct: number) {
  if (tries === 0 || latest === null) return { text: '—', status: 'untouched' as const };
  const pct = Math.round((correct / tries) * 100);
  const label = latest === 'correct' ? 'Pass' : 'Fail';
  return { text: `${label} (${pct}%, ${tries})`, status: latest === 'correct' ? 'pass' as const : 'fail' as const };
}

export function NetworkingDashboard() {
  const [families, setFamilies] = useState<FamilyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNetworkingFamilies()
      .then(f => { setFamilies(f); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="container dp-dashboard"
      style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)', maxWidth: '1100px' }}
    >
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
        <h1 className="page-title">EE450 Networking Drill</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 'var(--space-sm)' }}>
          {families.length} problem families, each with procedurally generated drills.
        </p>
      </div>

      <div className="dp-table-wrapper">
        <table className="dp-table">
          <thead>
            <tr>
              <th className="dp-th-problem">Family</th>
              <th className="dp-th-stage">Overall</th>
              <th className="dp-th-stage">Sub-variants</th>
              <th className="dp-th-stage" style={{ minWidth: '110px' }}>Drill</th>
            </tr>
          </thead>
          <tbody>
            {families.map(fam => {
              const overall = formatStat(fam.latest_result, fam.tries, fam.correct);
              return (
                <tr key={fam.family}>
                  <td className="dp-td-problem">
                    <span className="dp-slug">{fam.label}</span>
                    <span className="dp-title">{fam.description}</span>
                  </td>
                  <td className={`dp-td-stage dp-stat-${overall.status}`}>{overall.text}</td>
                  <td className="dp-td-stage" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      {fam.generators.map(g => {
                        const s = formatStat(g.latest_result, g.tries, g.correct);
                        const color =
                          s.status === 'pass' ? 'var(--color-accent-green)'
                          : s.status === 'fail' ? 'var(--color-accent-red)'
                          : 'var(--color-text-muted)';
                        return (
                          <div key={g.slug} style={{ fontSize: '12px' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{g.label}:</span>{' '}
                            <span style={{ color, fontWeight: 500 }}>{s.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="dp-td-stage">
                    <Link
                      to={`/networking/study/${fam.family}`}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px' }}
                    >
                      <Play size={14} />
                      Drill
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
