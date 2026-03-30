import './Flashcard.css';

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="flashcard-container"
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
      <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-face flashcard-front" aria-hidden={isFlipped}>
          <div className="flashcard-label">Question</div>
          <p className="flashcard-text">{front}</p>
        </div>
        <div className="flashcard-face flashcard-back" aria-hidden={!isFlipped}>
          <div className="flashcard-label">Answer</div>
          <p className="flashcard-text">{back}</p>
        </div>
      </div>
    </div>
  );
}
