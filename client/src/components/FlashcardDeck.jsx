import { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";

function FlashcardDeck({ studySet, onSaveProgress }) {
  const [currentIndex, setCurrentIndex] = useState(studySet.progress?.last_position || 0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState(new Set());
  const [unknownIds, setUnknownIds] = useState(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [cards, setCards] = useState(studySet.flashcards || []);

  const currentCard = cards[currentIndex] || null;
  const progress = useMemo(() => {
    if (!cards.length) {
      return 0;
    }

    return ((currentIndex + 1) / cards.length) * 100;
  }, [cards.length, currentIndex]);

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((index) => Math.min(index + 1, cards.length - 1));
  };

  const handleMark = (status) => {
    if (!currentCard) {
      return;
    }

    setKnownIds((current) => {
      const next = new Set(current);
      if (status === "known") {
        next.add(currentCard.id);
      } else {
        next.delete(currentCard.id);
      }
      return next;
    });

    setUnknownIds((current) => {
      const next = new Set(current);
      if (status === "unknown") {
        next.add(currentCard.id);
      } else {
        next.delete(currentCard.id);
      }
      return next;
    });

    if (currentIndex < cards.length - 1) {
      handleNext();
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  const handleSave = () => {
    onSaveProgress?.({
      knownCount: knownIds.size,
      unknownCount: unknownIds.size,
      lastPosition: currentIndex,
      completionRate: Math.round(progress),
      mode: "learn",
      persistHistory: true,
    });
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div className="surface-card">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="eyebrow mb-1">Learn Mode</div>
          <h3 className="h4 mb-1">{studySet.title}</h3>
          <div className="text-muted small">
            {knownIds.size} known · {unknownIds.size} to revisit
            {isShuffled ? " · shuffled" : ""}
          </div>
        </div>
        <Button variant="outline-dark" className="rounded-pill" onClick={handleShuffle}>
          Shuffle
        </Button>
      </div>

      <ProgressBar now={progress} className="mb-4" />

      <button
        type="button"
        className={`flashcard-stage ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped((current) => !current)}
      >
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-label">Term</div>
          <div className="flashcard-content">{currentCard.term}</div>
          <div className="flashcard-meta">Tap to reveal the definition</div>
        </div>
        <div className="flashcard-face flashcard-back">
          <div className="flashcard-label">Definition</div>
          <div className="flashcard-content">{currentCard.definition}</div>
          {currentCard.example ? (
            <div className="flashcard-example mt-3">Example: {currentCard.example}</div>
          ) : null}
          {currentCard.hint ? (
            <div className="flashcard-hint mt-2">Hint: {currentCard.hint}</div>
          ) : null}
        </div>
      </button>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <Button variant="light" className="rounded-pill" onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button
          variant="dark"
          className="rounded-pill"
          onClick={() => handleMark("known")}
        >
          Mark Known
        </Button>
        <Button
          variant="outline-warning"
          className="rounded-pill"
          onClick={() => handleMark("unknown")}
        >
          Review Again
        </Button>
        <Button
          variant="light"
          className="rounded-pill"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
        </Button>
        <Button variant="outline-success" className="rounded-pill ms-auto" onClick={handleSave}>
          Save Progress
        </Button>
      </div>
    </div>
  );
}

export default FlashcardDeck;
