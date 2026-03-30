import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { DP_CATEGORIES } from '../data/dp-categories.js';
import './DPCategoryModal.css';

interface DPCategoryModalProps {
  onClose: () => void;
}

export function DPCategoryModal({ onClose }: DPCategoryModalProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="dp-modal-overlay" onClick={onClose}>
      <div className="dp-modal" onClick={e => e.stopPropagation()}>
        <div className="dp-modal-header">
          <h2>DP Category Guide</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="dp-modal-body">
          {DP_CATEGORIES.map(cat => {
            const isOpen = openId === cat.id;
            return (
              <div key={cat.id} className={`modal-cat-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="modal-cat-header"
                  onClick={() => toggle(cat.id)}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span className="modal-cat-number">{cat.id}</span>
                    <span className="modal-cat-name">{cat.name}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`modal-cat-chevron ${isOpen ? 'rotated' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="modal-cat-body markdown-content">
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
    </div>
  );
}
