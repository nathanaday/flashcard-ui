import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft, Check, X } from 'lucide-react';
import { useCards } from '../hooks/useCards.js';
import { useStudySession } from '../hooks/useStudySession.js';
import { useKeyboardNav } from '../hooks/useKeyboardNav.js';
import { Flashcard } from './Flashcard.js';
import { NavigationControls } from './NavigationControls.js';
import { ProgressSection } from './ProgressSection.js';
import { api } from '../api/client.js';
import type { StudySet } from '../types/index.js';

export function StudySession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setId = Number(id);
  const { cards, loading } = useCards(setId);
  const [setInfo, setSetInfo] = useState<StudySet | null>(null);
  const session = useStudySession(cards);

  useEffect(() => {
    api.getSets().then(sets => {
      const found = sets.find(s => s.id === setId);
      if (found) setSetInfo(found);
      else navigate('/');
    });
  }, [setId, navigate]);

  useKeyboardNav({
    onFlip: session.flip,
    onNext: session.goToNext,
    onPrev: session.goToPrev,
    enabled: cards.length > 0,
  });

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  const allDone = session.totalAnswered === cards.length && cards.length > 0;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)' }}>
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
          All sets
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">{setInfo?.name ?? 'Study Set'}</h1>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Link to={`/sets/${setId}/edit`} className="btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Pencil size={16} />
              Edit Cards
            </Link>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-page) var(--space-2xl)',
        }}>
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
            No cards in this set
          </p>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
            Add some cards to start studying.
          </p>
          <Link to={`/sets/${setId}/edit`} className="btn btn-primary">
            Add Cards
          </Link>
        </div>
      ) : (
        <>
          {/* Completion summary */}
          {allDone ? (
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-flashcard)',
              padding: 'var(--space-4xl)',
              textAlign: 'center',
              marginBottom: 'var(--space-2xl)',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Session Complete
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
                You reviewed all {cards.length} cards.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
                {session.know.length} correct, {session.stillLearning.length} still learning
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)' }}>
                <button className="btn btn-secondary" onClick={session.reset}>
                  Study Again
                </button>
                {session.stillLearning.length > 0 && (
                  <button className="btn btn-primary" onClick={() => {
                    session.reset();
                  }}>
                    Review Missed
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Flashcard */}
              {session.currentCard && (
                <Flashcard
                  front={session.currentCard.front}
                  back={session.currentCard.back}
                  isFlipped={session.isFlipped}
                  onFlip={session.flip}
                />
              )}

              {/* Result buttons - visible after flip */}
              {session.isFlipped && session.currentCard && !session.results[session.currentCard.id] && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--space-lg)',
                  marginBottom: 'var(--space-2xl)',
                }}>
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

              {/* Navigation */}
              <NavigationControls
                currentIndex={session.currentIndex}
                total={cards.length}
                onPrev={session.goToPrev}
                onNext={session.goToNext}
                onReset={session.reset}
              />
            </>
          )}

          {/* Progress sections */}
          <ProgressSection
            cards={cards}
            results={session.results}
            stillLearning={session.stillLearning}
            know={session.know}
          />
        </>
      )}
    </div>
  );
}
