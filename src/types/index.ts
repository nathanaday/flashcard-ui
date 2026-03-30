export interface StudySet {
  id: number;
  name: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: number;
  set_id: number;
  front: string;
  back: string;
  position: number;
  created_at: string;
}

export type CardResult = 'correct' | 'incorrect';
