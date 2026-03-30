import { useState, useEffect, useCallback } from 'react';
import type { Card } from '../types/index.js';
import { api } from '../api/client.js';

export function useCards(setId: number) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    try {
      const data = await api.getCards(setId);
      setCards(data);
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const addCard = async (front: string, back: string) => {
    await api.createCard(setId, front, back);
    await fetchCards();
  };

  const updateCard = async (id: number, front: string, back: string) => {
    await api.updateCard(id, front, back);
    await fetchCards();
  };

  const deleteCard = async (id: number) => {
    await api.deleteCard(id);
    await fetchCards();
  };

  return { cards, loading, addCard, updateCard, deleteCard, refresh: fetchCards };
}
