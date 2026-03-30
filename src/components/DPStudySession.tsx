import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Info } from 'lucide-react';
import { useDPStudy } from '../hooks/useDPStudy.js';
import { useKeyboardNav } from '../hooks/useKeyboardNav.js';
import { DPFlashcard } from './DPFlashcard.js';
import { NavigationControls } from './NavigationControls.js';
import { DPCategoryModal } from './DPCategoryModal.js';
import type { StageNumber } from '../types/dp.js';

const STAGE_LABELS: Record<number, string> = {
  1: 'Category',
  2: 'Variables & Definition',
  3: 'Recurrence & Complexity',
};

const STAGE_TITLES: Record<number, string> = {
  1: 'Stage 1: Recognize the Category',
  2: 'Stage 2: Define the Subproblem',
  3: 'Stage 3: Full Recurrence',
};

export function DPStudySession() {
  const { stage: stageStr } = useParams<{ stage: string }>();
  const [searchParams] = useSearchParams();
  const stage = Number(stageStr) as StageNumber;
  const category = searchParams.get('category') || undefined;

  const [showGuide, setShowGuide] = useState(false);
  const session = useDPStudy(stage, category);

  useKeyboardNav({
    onFlip: session.flip,
    onNext: session.goToNext,
    onPrev: session.goToPrev,
    enabled: session.cards.length > 0,
  });

  if (session.loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  const allDone = session.totalAnswered === session.cards.length && session.cards.length > 0;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link
          to="/dp"
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
          DP Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">{STAGE_TITLES[stage] || 'DP Study'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {category && (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-accent-blue)',
                  background: 'var(--color-accent-blue-light)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {category}
              </span>
            )}
            <button
              className="btn-small"
              onClick={() => setShowGuide(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}
            >
              <Info size={16} />
              Categories
            </button>
          </div>
        </div>
      </div>

      {session.cards.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-page) var(--space-2xl)',
          }}
        >
          <p
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-md)',
            }}
          >
            No problems available
          </p>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-2xl)',
            }}
          >
            Import DP problems to start studying.
          </p>
          <Link to="/dp" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <>
          {allDone ? (
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-flashcard)',
                padding: 'var(--space-4xl)',
                textAlign: 'center',
                marginBottom: 'var(--space-2xl)',
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Session Complete
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                You reviewed all {session.cards.length} problems.
              </p>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2xl)',
                }}
              >
                {session.know.length} correct, {session.stillLearning.length} still learning
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)' }}>
                <button className="btn btn-secondary" onClick={session.reset}>
                  Study Again
                </button>
                <Link to="/dp" className="btn btn-primary">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              {session.currentCard && (
                <DPFlashcard
                  front={session.currentCard.description}
                  back={session.currentCard.answer}
                  isFlipped={session.isFlipped}
                  onFlip={session.flip}
                  stageLabel={STAGE_LABELS[stage]}
                />
              )}

              {session.isFlipped && session.currentCard && !session.results[session.currentCard.id] && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-lg)',
                    marginBottom: 'var(--space-2xl)',
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    style={{
                      borderColor: 'var(--color-accent-orange-dark)',
                      color: 'var(--color-accent-orange-dark)',
                    }}
                    onClick={() => session.markResult(session.currentCard!.id, 'incorrect')}
                  >
                    <X size={18} />
                    Still learning
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{
                      borderColor: 'var(--color-accent-green)',
                      color: 'var(--color-accent-green)',
                    }}
                    onClick={() => session.markResult(session.currentCard!.id, 'correct')}
                  >
                    <Check size={18} />
                    Got it
                  </button>
                </div>
              )}

              <NavigationControls
                currentIndex={session.currentIndex}
                total={session.cards.length}
                onPrev={session.goToPrev}
                onNext={session.goToNext}
                onReset={session.reset}
              />
            </>
          )}

          {/* Progress summary at bottom */}
          {session.totalAnswered > 0 && !allDone && (
            <div
              style={{
                display: 'flex',
                gap: '2px',
                height: '8px',
                borderRadius: 'var(--radius-pill)',
                overflow: 'hidden',
                marginTop: 'var(--space-3xl)',
                background: 'var(--color-button-chip-bg)',
              }}
            >
              {session.know.length > 0 && (
                <div
                  style={{
                    width: `${(session.know.length / session.cards.length) * 100}%`,
                    background: 'var(--color-accent-green)',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width var(--transition-base)',
                  }}
                />
              )}
              {session.stillLearning.length > 0 && (
                <div
                  style={{
                    width: `${(session.stillLearning.length / session.cards.length) * 100}%`,
                    background: 'var(--color-accent-orange-dark)',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width var(--transition-base)',
                  }}
                />
              )}
            </div>
          )}
        </>
      )}

      {showGuide && <DPCategoryModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
