import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';
import type { DPProblemWithStats, DPCategory } from '../types/dp.js';

export function useDPDashboard() {
  const [problems, setProblems] = useState<DPProblemWithStats[]>([]);
  const [categories, setCategories] = useState<DPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getDPProblems(), api.getDPCategories()])
      .then(([probs, cats]) => {
        setProblems(probs);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredProblems = selectedCategory
    ? problems.filter(p => p.category === selectedCategory)
    : problems;

  return {
    problems: filteredProblems,
    allProblems: problems,
    categories,
    loading,
    selectedCategory,
    setSelectedCategory,
    refresh: load,
  };
}
