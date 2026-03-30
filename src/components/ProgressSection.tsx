import type { Card, CardResult } from '../types/index.js';

interface ProgressSectionProps {
  cards: Card[];
  results: Record<number, CardResult>;
  stillLearning: Card[];
  know: Card[];
}

export function ProgressSection({ cards, results, stillLearning, know }: ProgressSectionProps) {
  const totalAnswered = Object.keys(results).length;
  if (totalAnswered === 0) return null;

  return (
    <div style={{ marginTop: 'var(--space-3xl)' }}>
      {/* Progress bar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        height: '8px',
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden',
        marginBottom: 'var(--space-3xl)',
        background: 'var(--color-button-chip-bg)',
      }}>
        {know.length > 0 && (
          <div style={{
            width: `${(know.length / cards.length) * 100}%`,
            background: 'var(--color-accent-green)',
            borderRadius: 'var(--radius-pill)',
            transition: 'width var(--transition-base)',
          }} />
        )}
        {stillLearning.length > 0 && (
          <div style={{
            width: `${(stillLearning.length / cards.length) * 100}%`,
            background: 'var(--color-accent-orange-dark)',
            borderRadius: 'var(--radius-pill)',
            transition: 'width var(--transition-base)',
          }} />
        )}
      </div>

      {/* Still Learning section */}
      {stillLearning.length > 0 && (
        <div style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-xs)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-accent-orange-dark)',
            }}>
              Still learning ({stillLearning.length})
            </h3>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-lg)',
          }}>
            You've started learning these terms. Keep it up!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {stillLearning.map(card => (
              <CardRow key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* Know section */}
      {know.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-xs)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-accent-green)',
            }}>
              Know ({know.length})
            </h3>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-lg)',
          }}>
            You know these terms well.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {know.map(card => (
              <CardRow key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CardRow({ card }: { card: Card }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: 'var(--space-xl) var(--space-2xl)',
      display: 'flex',
      gap: 'var(--space-2xl)',
    }}>
      <div style={{
        flex: 1,
        fontSize: '15px',
        lineHeight: 1.55,
        paddingRight: 'var(--space-2xl)',
        borderRight: '1px solid var(--color-border)',
      }}>
        {card.front}
      </div>
      <div style={{
        flex: 1,
        fontSize: '15px',
        lineHeight: 1.55,
        paddingLeft: 'var(--space-2xl)',
      }}>
        {card.back}
      </div>
    </div>
  );
}
