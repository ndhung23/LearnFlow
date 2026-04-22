import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAuth from "../hooks/useAuth";
import quizService from "../services/quizService";
import studySetService from "../services/studySetService";
import { formatPercent } from "../utils/formatters";

function StudySetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studySet, setStudySet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizForm, setQuizForm] = useState({
    title: "",
    instructions: "",
    timeLimitMinutes: 10,
  });
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const loadStudySet = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await studySetService.getById(id);
      setStudySet(response);
      setQuizForm((current) => ({
        ...current,
        title: current.title || `${response.title} Quick Quiz`,
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the study set.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudySet();
  }, [id]);

  const handleBookmark = async () => {
    try {
      const updatedStudySet = studySet.is_bookmarked
        ? await studySetService.unbookmark(studySet.id)
        : await studySetService.bookmark(studySet.id);
      setStudySet(updatedStudySet);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update bookmark.");
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setCreatingQuiz(true);

    try {
      const quiz = await quizService.create({
        studySetId: studySet.id,
        ...quizForm,
      });
      await loadStudySet();
      setQuizForm({
        title: `${studySet.title} Quick Quiz`,
        instructions: "",
        timeLimitMinutes: 10,
      });
      navigate(`/quiz/${quiz.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create quiz.");
    } finally {
      setCreatingQuiz(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading study set..." />;
  }

  if (error && !studySet) {
    return <ErrorState message={error} onRetry={loadStudySet} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={studySet.subject || "Study Set"}
        title={studySet.title}
        description={studySet.description || "This set is ready for learn, quiz, test, and match modes."}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to={`/learn/${studySet.id}`} className="rounded-pill">
              Learn
            </Button>
            <Button as={Link} to={`/match/${studySet.id}`} variant="outline-dark" className="rounded-pill">
              Match
            </Button>
            {user.role !== "student" ? (
              <Button as={Link} to={`/study-sets/${studySet.id}/edit`} variant="outline-secondary" className="rounded-pill">
                Edit
              </Button>
            ) : null}
          </div>
        }
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="surface-card border-0">
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {(studySet.tags || []).map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="d-flex flex-wrap gap-3 text-muted small mb-4">
                <span>{studySet.flashcard_count} cards</span>
                <span>{studySet.quiz_count} quizzes</span>
                <span>{studySet.visibility}</span>
                <span>{studySet.class_title || "No linked class"}</span>
              </div>
              <div className="d-grid gap-3">
                {studySet.flashcards.map((flashcard, index) => (
                  <div key={flashcard.id} className="flashcard-preview">
                    <div className="small text-muted mb-2">Card {index + 1}</div>
                    <div className="fw-semibold">{flashcard.term}</div>
                    <div className="text-muted">{flashcard.definition}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="surface-card border-0 mb-4">
            <Card.Body>
              <div className="eyebrow mb-1">Progress</div>
              <h2 className="h5 mb-3">Your recent study state</h2>
              {studySet.progress ? (
                <div className="d-grid gap-2">
                  <div className="small text-muted">
                    Completion: {formatPercent(studySet.progress.completion_rate)}
                  </div>
                  <div className="small text-muted">
                    Known: {studySet.progress.known_count} · Review: {studySet.progress.unknown_count}
                  </div>
                </div>
              ) : (
                <div className="text-muted small">
                  Progress appears after you study this set in learn or match mode.
                </div>
              )}

              <Button
                variant={studySet.is_bookmarked ? "dark" : "outline-dark"}
                className="rounded-pill mt-4"
                onClick={handleBookmark}
              >
                {studySet.is_bookmarked ? "Saved to Bookmarks" : "Save to Bookmarks"}
              </Button>
            </Card.Body>
          </Card>

          <Card className="surface-card border-0">
            <Card.Body>
              <div className="eyebrow mb-1">Quizzes</div>
              <h2 className="h5 mb-4">Launch the right assessment mode</h2>

              {studySet.quizzes.length ? (
                <div className="d-grid gap-3 mb-4">
                  {studySet.quizzes.map((quiz) => (
                    <div key={quiz.id} className="activity-item">
                      <div className="fw-semibold">{quiz.title}</div>
                      <div className="small text-muted mb-2">
                        Pass score {quiz.pass_score}% · {quiz.time_limit_minutes || 10} min
                      </div>
                      <div className="d-flex gap-2">
                        <Button as={Link} to={`/quiz/${quiz.id}`} size="sm" className="rounded-pill">
                          Quiz
                        </Button>
                        <Button
                          as={Link}
                          to={`/test/${quiz.id}`}
                          size="sm"
                          variant="outline-dark"
                          className="rounded-pill"
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No quizzes yet"
                  description="Generate a quiz to give learners a faster review path."
                />
              )}

              {user.role !== "student" ? (
                <Form className="d-grid gap-3 mt-4" onSubmit={handleCreateQuiz}>
                  <Form.Control
                    placeholder="Quiz title"
                    value={quizForm.title}
                    onChange={(event) =>
                      setQuizForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Instructions"
                    value={quizForm.instructions}
                    onChange={(event) =>
                      setQuizForm((current) => ({ ...current, instructions: event.target.value }))
                    }
                  />
                  <Form.Control
                    type="number"
                    min="5"
                    value={quizForm.timeLimitMinutes}
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        timeLimitMinutes: Number(event.target.value),
                      }))
                    }
                  />
                  <Button type="submit" disabled={creatingQuiz} className="rounded-pill">
                    {creatingQuiz ? "Creating..." : "Generate Quiz"}
                  </Button>
                </Form>
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StudySetDetailPage;
