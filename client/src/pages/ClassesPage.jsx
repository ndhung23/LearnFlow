import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
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
import classService from "../services/classService";

function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [classForm, setClassForm] = useState({
    title: "",
    subject: "",
    description: "",
  });
  const [joinId, setJoinId] = useState("");

  const loadClasses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await classService.list();
      setClasses(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (event) => {
    event.preventDefault();
    setNotice("");

    try {
      await classService.create(classForm);
      setClassForm({ title: "", subject: "", description: "" });
      setNotice("Class created successfully.");
      await loadClasses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create class.");
    }
  };

  const handleJoinClass = async (event) => {
    event.preventDefault();
    setNotice("");

    try {
      const response = await classService.join(joinId);
      setJoinId("");
      setNotice(response.alreadyJoined ? "You were already in this class." : "Joined class successfully.");
      await loadClasses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to join class.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading classes..." />;
  }

  if (error && !classes.length) {
    return <ErrorState message={error} onRetry={loadClasses} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Classes"
        title={user.role === "student" ? "Your Learning Spaces" : "Manage Classes"}
        description={
          user.role === "student"
            ? "See the classes you belong to and jump straight into assigned study."
            : "Create classes, monitor membership, and share the right learning sets with the right group."
        }
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Row className="g-4 mb-4">
        {user.role !== "student" ? (
          <Col lg={5}>
            <Card className="surface-card border-0">
              <Card.Body>
                <div className="eyebrow mb-1">Create Class</div>
                <h2 className="h5 mb-4">Set up a new cohort</h2>
                <Form className="d-grid gap-3" onSubmit={handleCreateClass}>
                  <Form.Control
                    placeholder="Class title"
                    value={classForm.title}
                    onChange={(event) =>
                      setClassForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                  <Form.Control
                    placeholder="Subject"
                    value={classForm.subject}
                    onChange={(event) =>
                      setClassForm((current) => ({ ...current, subject: event.target.value }))
                    }
                  />
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Description"
                    value={classForm.description}
                    onChange={(event) =>
                      setClassForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                  <Button type="submit" className="rounded-pill">
                    Create Class
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          <Col lg={5}>
            <Card className="surface-card border-0">
              <Card.Body>
                <div className="eyebrow mb-1">Join Class</div>
                <h2 className="h5 mb-4">Enter a class ID from your teacher</h2>
                <Form className="d-grid gap-3" onSubmit={handleJoinClass}>
                  <Form.Control
                    placeholder="Class ID"
                    value={joinId}
                    onChange={(event) => setJoinId(event.target.value)}
                  />
                  <Button type="submit" className="rounded-pill">
                    Join Class
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        )}

        <Col lg={7}>
          <Card className="surface-card border-0">
            <Card.Body>
              <div className="eyebrow mb-1">Quick Tips</div>
              <h2 className="h5 mb-3">How to use classes well</h2>
              <ul className="mb-0 text-muted">
                <li>Share the numeric class ID with students so they can join quickly.</li>
                <li>Attach study sets to a class when you want class-only visibility.</li>
                <li>Use assignments to add deadlines and progress tracking for each student.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {classes.length ? (
        <Row className="g-4">
          {classes.map((classItem) => (
            <Col key={classItem.id} md={6} xl={4}>
              <Card className="surface-card border-0 h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="eyebrow mb-1">{classItem.subject || "General"}</div>
                  <h3 className="h5 mb-2">{classItem.title}</h3>
                  <div className="text-muted small mb-3">
                    Code: {classItem.code} · ID: {classItem.id}
                  </div>
                  <p className="text-muted flex-grow-1">
                    {classItem.description || "No class description available."}
                  </p>
                  <div className="small text-muted mb-3">
                    {classItem.student_count} students · {classItem.study_set_count} study sets
                  </div>
                  <Button as={Link} to={`/classes/${classItem.id}`} className="rounded-pill">
                    Open Class
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState
          title="No classes yet"
          description={
            user.role === "student"
              ? "Join a class to see assignments and class-only study sets here."
              : "Create your first class to start organizing learners."
          }
        />
      )}
    </div>
  );
}

export default ClassesPage;
