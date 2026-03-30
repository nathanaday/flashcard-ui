import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface NavigationControlsProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function NavigationControls({
  currentIndex,
  total,
  onPrev,
  onNext,
  onReset,
}: NavigationControlsProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 'var(--space-3xl)',
    }}>
      <button
        className="btn-icon"
        onClick={onReset}
        aria-label="Reset session"
        title="Reset session"
      >
        <RotateCcw size={20} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
        <button
          className="btn-icon"
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous card"
          style={{ opacity: isFirst ? 0.35 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>

        <span style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          minWidth: '60px',
          textAlign: 'center',
        }}>
          {currentIndex + 1} / {total}
        </span>

        <button
          className="btn-icon"
          onClick={onNext}
          disabled={isLast}
          aria-label="Next card"
          style={{ opacity: isLast ? 0.35 : 1, cursor: isLast ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ width: '36px' }} />
    </div>
  );
}
