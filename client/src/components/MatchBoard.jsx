import { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";

function MatchBoard({ flashcards, onComplete }) {
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const definitions = useMemo(
    () => [...flashcards].sort(() => Math.random() - 0.5),
    [flashcards]
  );

  const handlePickDefinition = (flashcardId) => {
    if (!selectedTermId) {
      return;
    }

    if (selectedTermId === flashcardId) {
      const nextMatched = [...matchedIds, flashcardId];
      setMatchedIds(nextMatched);
      setSelectedTermId(null);

      if (nextMatched.length === flashcards.length) {
        onComplete?.({
          knownCount: flashcards.length,
          unknownCount: 0,
          lastPosition: flashcards.length,
          completionRate: 100,
          mode: "match",
        });
      }

      return;
    }

    setSelectedTermId(null);
  };

  return (
    <div className="surface-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="eyebrow mb-1">Matching Mode</div>
          <h3 className="h4 mb-1">Pair each term with the right definition</h3>
          <div className="text-muted small">
            {matchedIds.length} of {flashcards.length} matched
          </div>
        </div>
        <Button variant="outline-success" className="rounded-pill" onClick={() => onComplete?.({
          knownCount: matchedIds.length,
          unknownCount: flashcards.length - matchedIds.length,
          lastPosition: matchedIds.length,
          completionRate: Math.round((matchedIds.length / flashcards.length) * 100),
          mode: "match",
        })}>
          Save Match Session
        </Button>
      </div>

      <div className="match-grid">
        <div className="match-column">
          <div className="match-column-title">Terms</div>
          {flashcards.map((flashcard) => (
            <button
              key={flashcard.id}
              type="button"
              disabled={matchedIds.includes(flashcard.id)}
              className={`match-chip ${selectedTermId === flashcard.id ? "selected" : ""} ${
                matchedIds.includes(flashcard.id) ? "matched" : ""
              }`}
              onClick={() => setSelectedTermId(flashcard.id)}
            >
              {flashcard.term}
            </button>
          ))}
        </div>

        <div className="match-column">
          <div className="match-column-title">Definitions</div>
          {definitions.map((flashcard) => (
            <button
              key={flashcard.id}
              type="button"
              disabled={matchedIds.includes(flashcard.id)}
              className={`match-chip ${matchedIds.includes(flashcard.id) ? "matched" : ""}`}
              onClick={() => handlePickDefinition(flashcard.id)}
            >
              {flashcard.definition}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchBoard;
