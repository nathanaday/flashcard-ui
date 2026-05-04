export type NetworkingFamily =
  | 'class_id'
  | 'host_count'
  | 'public_private'
  | 'subnet_bits'
  | 'subnet_enum'
  | 'subnet_range'
  | 'subnet_mask'
  | 'subnet_and'
  | 'same_subnet'
  | 'cidr_count'
  | 'cidr_range'
  | 'cidr_equiv';

export type AttemptResult = 'correct' | 'incorrect';

export interface GeneratorStats {
  slug: string;
  label: string;
  tries: number;
  correct: number;
  latest_result: AttemptResult | null;
}

export interface FamilyStats {
  family: NetworkingFamily;
  label: string;
  description: string;
  tries: number;
  correct: number;
  latest_result: AttemptResult | null;
  generators: GeneratorStats[];
}

export interface NetworkingStudyCard {
  id: string;
  family: NetworkingFamily;
  generator: string;
  question: string;
  answer: string;
}
