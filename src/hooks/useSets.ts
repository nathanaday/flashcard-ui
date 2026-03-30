import { useState, useEffect, useCallback } from 'react';
import type { StudySet } from '../types/index.js';
import { api } from '../api/client.js';

export function useSets() {
  const [sets, setSets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSets = useCallback(async () => {
    try {
      const data = await api.getSets();
      setSets(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const createSet = async (name: string) => {
    await api.createSet(name);
    await fetchSets();
  };

  const renameSet = async (id: number, name: string) => {
    await api.renameSet(id, name);
    await fetchSets();
  };

  const deleteSet = async (id: number) => {
    await api.deleteSet(id);
    await fetchSets();
  };

  return { sets, loading, createSet, renameSet, deleteSet, refresh: fetchSets };
}
