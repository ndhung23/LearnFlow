import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import QuizRunner from "../components/QuizRunner";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import quizService from "../services/quizService";

function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await quizService.getById(id);
      setQuiz(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load this quiz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError("");

    try {
      const submissionResult = await quizService.submit(id, payload);
      setResult(submissionResult);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading quiz..." />;
  }

  if (error && !quiz) {
    return <ErrorState message={error} onRetry={loadQuiz} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quiz"
        title={quiz.title}
        description="Practice mode gives you immediate structure without the extra pressure of a timed test."
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <QuizRunner quiz={quiz} onSubmit={handleSubmit} submitting={submitting} />

      {result ? (
        <Card className="surface-card border-0 mt-4">
          <Card.Body>
            <div className="eyebrow mb-1">Result</div>
            <h2 className="h4 mb-2">{result.score}% score</h2>
            <p className="text-muted">
              {result.correctAnswers} of {result.totalQuestions} correct.{" "}
              {result.passed ? "You passed this quiz." : "Review the answers below and try again."}
            </p>
            <div className="d-grid gap-3 mt-4">
              {result.review.map((item) => (
                <div key={item.questionId} className="activity-item">
                  <div className="fw-semibold">{item.prompt}</div>
                  <div className="small text-muted">
                    Your answer: {item.answerText || "No answer"} · Correct: {item.correctAnswer}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      ) : null}
    </div>
  );
}

export default QuizPage;
