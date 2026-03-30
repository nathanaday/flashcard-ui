import type { StudySet, Card } from '../types/index.js';
import type { DPProblemWithStats, DPProblem, DPStudyCard, DPCategory } from '../types/dp.js';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getSets: () => request<StudySet[]>('/sets'),
  createSet: (name: string) => request<StudySet>('/sets', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  renameSet: (id: number, name: string) => request<StudySet>(`/sets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }),
  deleteSet: (id: number) => request<void>(`/sets/${id}`, { method: 'DELETE' }),

  getCards: (setId: number) => request<Card[]>(`/sets/${setId}/cards`),
  createCard: (setId: number, front: string, back: string) => request<Card>(`/sets/${setId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ front, back }),
  }),
  updateCard: (id: number, front: string, back: string) => request<Card>(`/cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ front, back }),
  }),
  deleteCard: (id: number) => request<void>(`/cards/${id}`, { method: 'DELETE' }),

  // DP endpoints
  getDPProblems: () => request<DPProblemWithStats[]>('/dp/problems'),
  getDPProblem: (id: number) => request<DPProblem>(`/dp/problems/${id}`),
  getDPStudyCards: (stage: number, category?: string) => {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<DPStudyCard[]>(`/dp/study/${stage}${params}`);
  },
  recordDPAttempt: (problemId: number, stage: number, result: 'correct' | 'incorrect') =>
    request<{ id: number }>('/dp/attempts', {
      method: 'POST',
      body: JSON.stringify({ problem_id: problemId, stage, result }),
    }),
  getDPCategories: () => request<DPCategory[]>('/dp/categories'),
};
