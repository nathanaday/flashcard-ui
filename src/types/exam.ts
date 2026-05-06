export type ExamQuestionType = 'tf' | 'mc';
export type ExamAttemptResult = 'correct' | 'incorrect';

export interface ExamQuestionWithStats {
  id: number;
  exam_slug: string;
  source_file: string;
  question_number: number;
  question_type: ExamQuestionType;
  question_text: string;
  answer: string;
  explanation: string;
  tries: number;
  correct: number;
  latest_result: ExamAttemptResult | null;
}

export interface ExamStudyCard {
  id: number;
  exam_slug: string;
  source_file: string;
  question_number: number;
  question_type: ExamQuestionType;
  question_text: string;
  answer: string;
  explanation: string;
}
