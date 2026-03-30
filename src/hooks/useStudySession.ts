import { useState, useCallback, useMemo } from 'react';
import type { Card, CardResult } from '../types/index.js';

interface StudyState {
  currentIndex: number;
  isFlipped: boolean;
  results: Record<number, CardResult>;
}

export function useStudySession(cards: Card[]) {
  const [state, setState] = useState<StudyState>({
    currentIndex: 0,
    isFlipped: false,
    results: {},
  });

  const currentCard = cards[state.currentIndex] ?? null;

  const flip = useCallback(() => {
    setState(s => ({ ...s, isFlipped: !s.isFlipped }));
  }, []);

  const goToNext = useCallback(() => {
    setState(s => {
      if (s.currentIndex >= cards.length - 1) return s;
      return { ...s, currentIndex: s.currentIndex + 1, isFlipped: false };
    });
  }, [cards.length]);

  const goToPrev = useCallback(() => {
    setState(s => {
      if (s.currentIndex <= 0) return s;
      return { ...s, currentIndex: s.currentIndex - 1, isFlipped: false };
    });
  }, []);

  const markResult = useCallback((cardId: number, result: CardResult) => {
    setState(s => {
      const newResults = { ...s.results, [cardId]: result };
      const nextIndex = s.currentIndex < cards.length - 1 ? s.currentIndex + 1 : s.currentIndex;
      return { ...s, results: newResults, currentIndex: nextIndex, isFlipped: false };
    });
  }, [cards.length]);

  const reset = useCallback(() => {
    setState({ currentIndex: 0, isFlipped: false, results: {} });
  }, []);

  const stillLearning = useMemo(
    () => cards.filter(c => state.results[c.id] === 'incorrect'),
    [cards, state.results]
  );

  const know = useMemo(
    () => cards.filter(c => state.results[c.id] === 'correct'),
    [cards, state.results]
  );

  const totalAnswered = Object.keys(state.results).length;

  return {
    currentIndex: state.currentIndex,
    currentCard,
    isFlipped: state.isFlipped,
    results: state.results,
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
