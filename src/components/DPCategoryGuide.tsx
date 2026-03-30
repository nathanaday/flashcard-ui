import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { DP_CATEGORIES } from '../data/dp-categories.js';
import './DPCategoryGuide.css';

export function DPCategoryGuide() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)', maxWidth: '870px' }}>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <Link
          to="/dp"
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
          DP Dashboard
        </Link>
        <h1 className="page-title">DP Category Guide</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 'var(--space-sm)' }}>
          Learn to recognize the 9 families of dynamic programming problems.
        </p>
      </div>

      <div className="category-accordion">
        {DP_CATEGORIES.map(cat => {
          const isOpen = openId === cat.id;
          return (
            <div key={cat.id} className={`category-item ${isOpen ? 'open' : ''}`}>
              <button
                className="category-header"
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
              >
                <div className="category-header-left">
                  <span className="category-number">{cat.id}</span>
                  <span className="category-name">{cat.name}</span>
                </div>
                <ChevronDown
                  size={20}
                  className={`category-chevron ${isOpen ? 'rotated' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="category-body markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {cat.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
