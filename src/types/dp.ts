export interface DPProblem {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  stage1_answer: string;
  stage2_answer: string;
  stage3_answer: string;
  source_file: string;
  created_at: string;
}

export interface DPProblemWithStats extends DPProblem {
  stage1_latest: 'correct' | 'incorrect' | null;
  stage1_tries: number;
  stage1_correct: number;
  stage2_latest: 'correct' | 'incorrect' | null;
  stage2_tries: number;
  stage2_correct: number;
  stage3_latest: 'correct' | 'incorrect' | null;
  stage3_tries: number;
  stage3_correct: number;
}

export interface DPStudyCard {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  answer: string;
}

export interface DPCategory {
  category: string;
  count: number;
}

export type StageNumber = 1 | 2 | 3;
