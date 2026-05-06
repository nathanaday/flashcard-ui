import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useExamStudy } from '../hooks/useExamStudy.js';
import { useKeyboardNav } from '../hooks/useKeyboardNav.js';
import { DPFlashcard } from './DPFlashcard.js';
import { NavigationControls } from './NavigationControls.js';
import type { ExamStudyCard } from '../types/exam.js';

const EXAM_LABELS: Record<string, string> = {
  ee450: 'EE450 Final Exam',
};

function examLabel(slug: string) {
  return EXAM_LABELS[slug] ?? `${slug} Exam`;
}

function sourceLabel(file: string) {
  return file
    .replace(/\.md$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function buildBack(card: ExamStudyCard): string {
  return `**Answer: ${card.answer}**\n\n${card.explanation}`;
}

function cardBadge(card: ExamStudyCard): string {
  return `Q${card.question_number} · ${sourceLabel(card.source_file)}`;
}

export function ExamStudySession() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');

  const session = useExamStudy(slug, source);

  useKeyboardNav({
    onFlip: session.flip,
    onNext: session.goToNext,
    onPrev: session.goToPrev,
    enabled: session.cards.length > 0,
  });

  const stageLabel = useMemo(() => {
    if (!session.currentCard) return 'Answer';
    return session.currentCard.question_type === 'mc' ? 'Multiple Choice Answer' : 'True/False Answer';
  }, [session.currentCard]);

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
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link
          to={`/exam/${slug}`}
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
          Back to {examLabel(slug)}
        </Link>
        <h1 className="page-title">
          {examLabel(slug)}
          {source && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}> · {sourceLabel(source)}</span>}
        </h1>
      </div>

      {session.cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-page) var(--space-2xl)' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            No questions to study.
          </p>
          <Link to={`/exam/${slug}`} className="btn btn-primary">Back to Dashboard</Link>
        </div>
      ) : allDone ? (
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
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Session Complete</h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
            You reviewed all {session.cards.length} questions.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
            {session.know.length} correct, {session.stillLearning.length} still learning
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)' }}>
            <button className="btn btn-secondary" onClick={session.reset}>Study Again</button>
            <Link to={`/exam/${slug}`} className="btn btn-primary">Back to Dashboard</Link>
          </div>
        </div>
      ) : (
        <>
          {session.currentCard && (
            <DPFlashcard
              front={session.currentCard.question_text}
              back={buildBack(session.currentCard)}
              isFlipped={session.isFlipped}
              onFlip={session.flip}
              stageLabel={stageLabel}
              slug={cardBadge(session.currentCard)}
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
                onClick={() => session.markResult(session.currentCard!, 'incorrect')}
              >
                <X size={18} />
                Got it wrong
              </button>
              <button
                className="btn btn-secondary"
                style={{
                  borderColor: 'var(--color-accent-green)',
                  color: 'var(--color-accent-green)',
                }}
                onClick={() => session.markResult(session.currentCard!, 'correct')}
              >
                <Check size={18} />
                Got it right
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
    </div>
  );
}
