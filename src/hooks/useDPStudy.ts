import { useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../api/client.js';
import type { DPStudyCard, StageNumber } from '../types/dp.js';

interface DPStudyState {
  cards: DPStudyCard[];
  currentIndex: number;
  isFlipped: boolean;
  results: Record<number, 'correct' | 'incorrect'>;
  loading: boolean;
}

export function useDPStudy(stage: StageNumber, category?: string) {
  const [state, setState] = useState<DPStudyState>({
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    results: {},
    loading: true,
  });

  // Load cards
  useEffect(() => {
    setState(s => ({ ...s, loading: true }));
    api.getDPStudyCards(stage, category).then(cards => {
      setState({ cards, currentIndex: 0, isFlipped: false, results: {}, loading: false });
    }).catch(() => {
      setState(s => ({ ...s, loading: false }));
    });
  }, [stage, category]);

  const currentCard = state.cards[state.currentIndex] ?? null;

  const flip = useCallback(() => {
    setState(s => ({ ...s, isFlipped: !s.isFlipped }));
  }, []);

  const goToNext = useCallback(() => {
    setState(s => {
      if (s.currentIndex >= s.cards.length - 1) return s;
      return { ...s, currentIndex: s.currentIndex + 1, isFlipped: false };
    });
  }, []);

  const goToPrev = useCallback(() => {
    setState(s => {
      if (s.currentIndex <= 0) return s;
      return { ...s, currentIndex: s.currentIndex - 1, isFlipped: false };
    });
  }, []);

  const markResult = useCallback((cardId: number, result: 'correct' | 'incorrect') => {
    // Persist to backend
    api.recordDPAttempt(cardId, stage, result).catch(console.error);

    setState(s => {
      const newResults = { ...s.results, [cardId]: result };
      const nextIndex = s.currentIndex < s.cards.length - 1 ? s.currentIndex + 1 : s.currentIndex;
      return { ...s, results: newResults, currentIndex: nextIndex, isFlipped: false };
    });
  }, [stage]);

  const reset = useCallback(() => {
    // Re-shuffle by re-fetching
    setState(s => ({ ...s, loading: true }));
    api.getDPStudyCards(stage, category).then(cards => {
      setState({ cards, currentIndex: 0, isFlipped: false, results: {}, loading: false });
    });
  }, [stage, category]);

  const stillLearning = useMemo(
    () => state.cards.filter(c => state.results[c.id] === 'incorrect'),
    [state.cards, state.results]
  );

  const know = useMemo(
    () => state.cards.filter(c => state.results[c.id] === 'correct'),
    [state.cards, state.results]
  );

  const totalAnswered = Object.keys(state.results).length;

  return {
    cards: state.cards,
    currentIndex: state.currentIndex,
    currentCard,
    isFlipped: state.isFlipped,
    results: state.results,
    loading: state.loading,
    flip,
    goToNext,
    goToPrev,
    markResult,
    reset,
    stillLearning,
    know,
    totalAnswered,
  };
}
