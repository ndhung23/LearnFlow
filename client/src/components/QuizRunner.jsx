import { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Stack from "react-bootstrap/Stack";
import { formatPercent } from "../utils/formatters";

function QuizRunner({ quiz, mode = "quiz", onSubmit, submitting }) {
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(
    mode === "test" ? (quiz.time_limit_minutes || 10) * 60 : null
  );
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    if (mode !== "test" || secondsLeft === null) {
      return undefined;
    }

    if (secondsLeft <= 0 && !autoSubmitted) {
      setAutoSubmitted(true);
      onSubmit({
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId: Number(questionId),
          ...value,
        })),
        mode,
      });
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [answers, autoSubmitted, mode, onSubmit, secondsLeft]);

  const completion = useMemo(() => {
    const total = quiz.questions.length || 1;
    return (Object.keys(answers).length / total) * 100;
  }, [answers, quiz.questions.length]);

  const handleChoiceChange = (questionId, selectedChoiceId) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        selectedChoiceId,
      },
    }));
  };

  const handleTextChange = (questionId, answerText) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        answerText,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      answers: Object.entries(answers).map(([questionId, value]) => ({
        questionId: Number(questionId),
        ...value,
      })),
      mode,
    });
  };

  return (
    <form className="surface-card" onSubmit={handleSubmit}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="eyebrow mb-1">{mode === "test" ? "Test Mode" : "Quiz Mode"}</div>
          <h3 className="h4 mb-1">{quiz.title}</h3>
          <div className="text-muted small">{quiz.instructions || "Answer each question carefully."}</div>
        </div>
        {mode === "test" ? (
          <div className="timer-pill">
            {Math.max(secondsLeft, 0)}s left
          </div>
        ) : null}
      </div>

      <ProgressBar now={completion} className="mb-4" />

      <Stack gap={4}>
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="quiz-question-block">
            <div className="fw-semibold mb-2">
              {index + 1}. {question.prompt}
            </div>
            {question.question_type === "fill_blank" ? (
              <Form.Control
                value={answers[question.id]?.answerText || ""}
                onChange={(event) => handleTextChange(question.id, event.target.value)}
                placeholder="Type your answer"
              />
            ) : (
              <div className="d-grid gap-2">
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={`answer-choice ${
                      answers[question.id]?.selectedChoiceId === choice.id ? "selected" : ""
                    }`}
                    onClick={() => handleChoiceChange(question.id, choice.id)}
                  >
                    {choice.choice_text}
                  </button>
                ))}
              </div>
            )}
            {question.explanation ? (
              <div className="small text-muted mt-2">{question.explanation}</div>
            ) : null}
          </div>
        ))}
      </Stack>

      <Alert variant="light" className="mt-4 border-0 answer-summary">
        You have answered {Object.keys(answers).length} of {quiz.questions.length} questions.
        Current completion: {formatPercent(completion)}.
      </Alert>

      <div className="d-flex justify-content-end">
        <Button type="submit" disabled={submitting} className="rounded-pill px-4">
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default QuizRunner;
