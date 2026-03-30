import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './DPFlashcard.css';

interface DPFlashcardProps {
  front: string;        // markdown content (problem description)
  back: string;         // markdown content (stage answer)
  isFlipped: boolean;
  onFlip: () => void;
  stageLabel?: string;  // e.g. "Stage 1: Recognize the Category"
}

export function DPFlashcard({ front, back, isFlipped, onFlip, stageLabel }: DPFlashcardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when card flips
  useEffect(() => {
    if (containerRef.current) {
      const faces = containerRef.current.querySelectorAll('.dp-flashcard-face');
      faces.forEach(face => face.scrollTop = 0);
    }
  }, [isFlipped]);

  return (
    <div
      className="dp-flashcard-container"
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={`Flashcard. ${isFlipped ? 'Showing answer' : 'Showing question. Press to reveal answer.'}`}
      onClick={onFlip}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className={`dp-flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className="dp-flashcard-face dp-flashcard-front" aria-hidden={isFlipped}>
          <div className="dp-flashcard-label">Problem</div>
          <div className="dp-flashcard-content markdown-content">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {front}
            </ReactMarkdown>
          </div>
        </div>
        <div className="dp-flashcard-face dp-flashcard-back" aria-hidden={!isFlipped}>
          <div className="dp-flashcard-label">{stageLabel || 'Answer'}</div>
          <div className="dp-flashcard-content markdown-content">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {back}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
