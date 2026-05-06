import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import type { ExamQuestionWithStats } from '../types/exam.js';

export function useExamDashboard(slug: string) {
  const [questions, setQuestions] = useState<ExamQuestionWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getExamQuestions(slug)
      .then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return { questions, loading };
}
