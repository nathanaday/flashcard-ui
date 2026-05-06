import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { useExamDashboard } from '../hooks/useExamDashboard.js';
import type { ExamAttemptResult, ExamQuestionWithStats } from '../types/exam.js';
import './DPDashboard.css';

const EXAM_LABELS: Record<string, string> = {
  ee450: 'EE450 Final Exam',
};

function examLabel(slug: string) {
  return EXAM_LABELS[slug] ?? `${slug} Exam`;
}

function sourceLabel(file: string) {
  return file
    .replace(/\.md$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatStat(latest: ExamAttemptResult | null, tries: number, correct: number) {
  if (tries === 0 || latest === null) return { text: '—', status: 'untouched' as const };
  const pct = Math.round((correct / tries) * 100);
  const label = latest === 'correct' ? 'Pass' : 'Fail';
  return { text: `${label} (${pct}%, ${tries})`, status: latest === 'correct' ? 'pass' as const : 'fail' as const };
}

function previewText(markdown: string, max = 110) {
  const flat = markdown.replace(/\s+/g, ' ').trim();
  return flat.length > max ? flat.slice(0, max - 1) + '…' : flat;
}

interface Group {
  source: string;
  questions: ExamQuestionWithStats[];
  tries: number;
  correct: number;
}

function groupBySource(questions: ExamQuestionWithStats[]): Group[] {
  const groups = new Map<string, Group>();
  for (const q of questions) {
    let g = groups.get(q.source_file);
    if (!g) {
      g = { source: q.source_file, questions: [], tries: 0, correct: 0 };
      groups.set(q.source_file, g);
    }
    g.questions.push(q);
    g.tries += q.tries;
    g.correct += q.correct;
  }
  return [...groups.values()].sort((a, b) => a.source.localeCompare(b.source));
}

export function ExamDashboard() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { questions, loading } = useExamDashboard(slug);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const groups = useMemo(() => groupBySource(questions), [questions]);

  const visible = useMemo(
    () => sourceFilter ? questions.filter(q => q.source_file === sourceFilter) : questions,
    [questions, sourceFilter],
  );

  const totalTries = questions.reduce((acc, q) => acc + q.tries, 0);
  const totalCorrect = questions.reduce((acc, q) => acc + q.correct, 0);
  const accuracy = totalTries === 0 ? null : Math.round((totalCorrect / totalTries) * 100);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-4xl)' }}>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  const studyHref = sourceFilter
    ? `/exam/${slug}/study?source=${encodeURIComponent(sourceFilter)}`
    : `/exam/${slug}/study`;

  return (
    <div
      className="container dp-dashboard"
      style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)', maxWidth: '1100px' }}
    >
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: 'var(--space-lg)',
          }}
        >
          <ArrowLeft size={16} />
          All Study Sets
        </Link>
        <h1 className="page-title">{examLabel(slug)}</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 'var(--space-sm)' }}>
          {questions.length} questions across {groups.length} {groups.length === 1 ? 'set' : 'sets'}
          {accuracy !== null && ` · ${accuracy}% accuracy over ${totalTries} attempts`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          to={studyHref}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}
        >
          <Play size={16} />
          Start Exam {sourceFilter ? `(${sourceLabel(sourceFilter)})` : ''}
        </Link>
      </div>

      {groups.length > 1 && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap' }}>
          <button
            className={`chip ${sourceFilter === null ? 'active' : ''}`}
            onClick={() => setSourceFilter(null)}
            style={{ padding: '0 16px' }}
          >
            All ({questions.length})
          </button>
          {groups.map(g => (
            <button
              key={g.source}
              className={`chip ${sourceFilter === g.source ? 'active' : ''}`}
              onClick={() => setSourceFilter(sourceFilter === g.source ? null : g.source)}
              style={{ padding: '0 16px' }}
            >
              {sourceLabel(g.source)} ({g.questions.length})
            </button>
          ))}
        </div>
      )}

      {questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-page) var(--space-2xl)', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            No questions found
          </p>
          <p style={{ fontSize: '15px' }}>
            Add markdown files under <code>content/{slug}/</code> and restart the server.
          </p>
        </div>
      ) : (
        <div className="dp-table-wrapper">
          <table className="dp-table">
            <thead>
              <tr>
                <th className="dp-th-stage" style={{ minWidth: '60px' }}>#</th>
                <th className="dp-th-problem">Question</th>
                <th className="dp-th-category">Type</th>
                <th className="dp-th-stage">Answer</th>
                <th className="dp-th-stage">Score</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(q => {
                const stat = formatStat(q.latest_result, q.tries, q.correct);
                return (
                  <tr key={q.id}>
                    <td className="dp-td-stage" style={{ fontWeight: 600 }}>
                      {q.question_number}
                    </td>
                    <td className="dp-td-problem">
                      <span className="dp-slug">{sourceLabel(q.source_file)}</span>
                      <span className="dp-title">{previewText(q.question_text)}</span>
                    </td>
                    <td className="dp-td-category">
                      <span className="dp-category-badge">
                        {q.question_type === 'tf' ? 'T/F' : 'Multi'}
                      </span>
                    </td>
                    <td className="dp-td-stage" style={{ fontFamily: "'SF Mono', monospace", fontSize: '12px' }}>
                      {q.answer.length > 28 ? q.answer.slice(0, 27) + '…' : q.answer}
                    </td>
                    <td className={`dp-td-stage dp-stat-${stat.status}`}>{stat.text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
