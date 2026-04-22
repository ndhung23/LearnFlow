import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import QuizRunner from "../components/QuizRunner";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import quizService from "../services/quizService";

function TestPage() {
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
      setError(requestError.response?.data?.message || "Unable to load this test.");
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
      const submissionResult = await quizService.submit(id, {
        ...payload,
        mode: "test",
      });
      setResult(submissionResult);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit test.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading test mode..." />;
  }

  if (error && !quiz) {
    return <ErrorState message={error} onRetry={loadQuiz} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Test"
        title={quiz.title}
        description="Timed mode adds pressure, keeps the order focused, and records a test submission."
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <QuizRunner quiz={quiz} mode="test" onSubmit={handleSubmit} submitting={submitting} />

      {result ? (
        <Card className="surface-card border-0 mt-4">
          <Card.Body>
            <div className="eyebrow mb-1">Test Result</div>
            <h2 className="h4 mb-2">{result.score}% score</h2>
            <p className="text-muted">
              {result.correctAnswers} correct out of {result.totalQuestions}.{" "}
              {result.passed ? "You met the target score." : "Review and retake when you're ready."}
            </p>
          </Card.Body>
        </Card>
      ) : null}
    </div>
  );
}

export default TestPage;
