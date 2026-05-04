import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useNetworkingStudy } from '../hooks/useNetworkingStudy.js';
import { useKeyboardNav } from '../hooks/useKeyboardNav.js';
import { DPFlashcard } from './DPFlashcard.js';
import { NavigationControls } from './NavigationControls.js';
import type { NetworkingFamily } from '../types/networking.js';

const FAMILY_LABELS: Record<NetworkingFamily, string> = {
  class_id: 'IP Class Identification',
  host_count: 'Host Count',
  public_private: 'Public vs Private',
  subnet_bits: 'Subnet Bits',
  subnet_enum: 'Subnet Enumeration',
  subnet_range: 'Subnet Host Range',
  subnet_mask: 'Subnet Mask',
  subnet_and: 'Subnet AND',
  same_subnet: 'Same-Subnet Check',
  cidr_count: 'CIDR Address Count',
  cidr_range: 'CIDR Range',
  cidr_equiv: 'CIDR Equivalences',
};

const FAMILIES = new Set(Object.keys(FAMILY_LABELS)) as Set<string>;

export function NetworkingStudySession() {
  const { family: familyParam } = useParams<{ family: string }>();
  const family = useMemo(() => {
    if (familyParam && FAMILIES.has(familyParam)) return familyParam as NetworkingFamily;
    return null;
  }, [familyParam]);

  const session = useNetworkingStudy(family ?? 'class_id', 10);

  useKeyboardNav({
    onFlip: session.flip,
    onNext: session.goToNext,
    onPrev: session.goToPrev,
    enabled: session.cards.length > 0,
  });

  if (!family) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Unknown family. <Link to="/networking">Back to dashboard</Link>
        </p>
      </div>
    );
  }

  if (session.loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  const allDone = session.totalAnswered === session.cards.length && session.cards.length > 0;
  const label = FAMILY_LABELS[family];

  return (
    <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)' }}>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link
          to="/networking"
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
          Networking Dashboard
        </Link>
        <h1 className="page-title">{label}</h1>
      </div>

      {session.cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-page) var(--space-2xl)' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            No problems generated.
          </p>
          <Link to="/networking" className="btn btn-primary">Back to Dashboard</Link>
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
            You reviewed all {session.cards.length} problems.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
            {session.know.length} correct, {session.stillLearning.length} still learning
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)' }}>
            <button className="btn btn-secondary" onClick={session.reset}>Study Again</button>
            <Link to="/networking" className="btn btn-primary">Back to Dashboard</Link>
          </div>
        </div>
      ) : (
        <>
          {session.currentCard && (
            <DPFlashcard
              front={session.currentCard.question}
              back={session.currentCard.answer}
              isFlipped={session.isFlipped}
              onFlip={session.flip}
              stageLabel={label}
              slug={session.currentCard.generator}
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
                Still learning
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
