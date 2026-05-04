import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import type { NetworkingFamily, NetworkingStudyCard, AttemptResult } from '../types/networking.js';

interface State {
  cards: NetworkingStudyCard[];
  currentIndex: number;
  isFlipped: boolean;
  results: Record<string, AttemptResult>;
  loading: boolean;
}

export function useNetworkingStudy(family: NetworkingFamily, count = 10) {
  const [state, setState] = useState<State>({
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    results: {},
    loading: true,
  });

  const load = useCallback(() => {
    setState(s => ({ ...s, loading: true }));
    api.getNetworkingStudy(family, count)
      .then(cards => setState({ cards, currentIndex: 0, isFlipped: false, results: {}, loading: false }))
      .catch(() => setState(s => ({ ...s, loading: false })));
  }, [family, count]);

  useEffect(() => { load(); }, [load]);

  const currentCard = state.cards[state.currentIndex] ?? null;

  const flip = useCallback(() => {
    setState(s => ({ ...s, isFlipped: !s.isFlipped }));
  }, []);

  const goToNext = useCallback(() => {
    setState(s => s.currentIndex >= s.cards.length - 1 ? s
      : { ...s, currentIndex: s.currentIndex + 1, isFlipped: false });
  }, []);

  const goToPrev = useCallback(() => {
    setState(s => s.currentIndex <= 0 ? s
      : { ...s, currentIndex: s.currentIndex - 1, isFlipped: false });
  }, []);

  const markResult = useCallback((card: NetworkingStudyCard, result: AttemptResult) => {
    api.recordNetworkingAttempt(card.family, card.generator, result).catch(console.error);
    setState(s => {
      const results = { ...s.results, [card.id]: result };
      const nextIndex = s.currentIndex < s.cards.length - 1 ? s.currentIndex + 1 : s.currentIndex;
      return { ...s, results, currentIndex: nextIndex, isFlipped: false };
    });
  }, []);

  const reset = useCallback(() => load(), [load]);

  const stillLearning = useMemo(
    () => state.cards.filter(c => state.results[c.id] === 'incorrect'),
    [state.cards, state.results],
  );
  const know = useMemo(
    () => state.cards.filter(c => state.results[c.id] === 'correct'),
    [state.cards, state.results],
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
