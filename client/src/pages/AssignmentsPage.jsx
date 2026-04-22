import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import AssignmentStatusBadge from "../components/AssignmentStatusBadge";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAuth from "../hooks/useAuth";
import assignmentService from "../services/assignmentService";
import classService from "../services/classService";
import studySetService from "../services/studySetService";
import { formatDate } from "../utils/formatters";

function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studySets, setStudySets] = useState([]);
  const [selectedStudySet, setSelectedStudySet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formValues, setFormValues] = useState({
    title: "",
    classId: "",
    studentId: "",
    studySetId: "",
    quizId: "",
    instructions: "",
    deadlineAt: "",
  });

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const [assignmentList, classList, studySetList] = await Promise.all([
        assignmentService.list(),
        user.role === "student" ? Promise.resolve([]) : classService.list(),
        user.role === "student"
          ? Promise.resolve({ studySets: [] })
          : studySetService.list({ page: 1, pageSize: 50 }),
      ]);

      setAssignments(assignmentList);
      setClasses(classList);
      setStudySets(studySetList.studySets || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [user.role]);

  useEffect(() => {
    if (!formValues.studySetId) {
      setSelectedStudySet(null);
      return;
    }

    let active = true;

    studySetService
      .getById(formValues.studySetId)
      .then((response) => {
        if (active) {
          setSelectedStudySet(response);
        }
      })
      .catch(() => {
        if (active) {
          setSelectedStudySet(null);
        }
      });

    return () => {
      active = false;
    };
  }, [formValues.studySetId]);

  const handleCreateAssignment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await assignmentService.create({
        ...formValues,
        classId: formValues.classId || null,
        studentId: formValues.studentId || null,
        quizId: formValues.quizId || null,
        studySetId: formValues.studySetId || null,
        deadlineAt: formValues.deadlineAt || null,
      });
      setNotice("Assignment created.");
      setFormValues({
        title: "",
        classId: "",
        studentId: "",
        studySetId: "",
        quizId: "",
        instructions: "",
        deadlineAt: "",
      });
      setSelectedStudySet(null);
      await loadPage();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create assignment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading assignments..." />;
  }

  if (error && !assignments.length && user.role === "student") {
    return <ErrorState message={error} onRetry={loadPage} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Assignments"
        title={user.role === "student" ? "Your Assigned Work" : "Create and Track Assignments"}
        description={
          user.role === "student"
            ? "See what is due, what is in progress, and what needs another try."
            : "Assign study sets or quizzes to a class, set deadlines, and monitor completion."
        }
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {user.role !== "student" ? (
        <Card className="surface-card border-0 mb-4">
          <Card.Body>
            <div className="eyebrow mb-1">New Assignment</div>
            <h2 className="h5 mb-4">Target a class, attach content, and set a deadline</h2>

            <Form onSubmit={handleCreateAssignment}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Control
                    placeholder="Assignment title"
                    value={formValues.title}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={formValues.classId}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, classId: event.target.value }))
                    }
                  >
                    <option value="">Choose class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.title}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="datetime-local"
                    value={formValues.deadlineAt}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, deadlineAt: event.target.value }))
                    }
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    placeholder="Optional student ID for direct assignment"
                    value={formValues.studentId}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, studentId: event.target.value }))
                    }
                  />
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={formValues.studySetId}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        studySetId: event.target.value,
                        quizId: "",
                      }))
                    }
                  >
                    <option value="">Choose study set</option>
                    {studySets.map((studySet) => (
                      <option key={studySet.id} value={studySet.id}>
                        {studySet.title}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={formValues.quizId}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, quizId: event.target.value }))
                    }
                    disabled={!selectedStudySet?.quizzes?.length}
                  >
                    <option value="">Optional quiz</option>
                    {(selectedStudySet?.quizzes || []).map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Instructions for students"
                    value={formValues.instructions}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, instructions: event.target.value }))
                    }
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button type="submit" disabled={saving} className="rounded-pill">
                  {saving ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : null}

      <Card className="surface-card border-0">
        <Card.Body>
          <div className="eyebrow mb-1">Assignment List</div>
          <h2 className="h5 mb-4">
            {user.role === "student" ? "Work in your queue" : "Assignments you created"}
          </h2>

          {assignments.length ? (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Resource</th>
                  <th>Deadline</th>
                  {user.role === "student" ? <th>Status</th> : <th>Completion</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <div className="fw-semibold">{assignment.title}</div>
                      <div className="small text-muted">
                        {assignment.class_title || assignment.teacher_name || "Direct assignment"}
                      </div>
                    </td>
                    <td>{assignment.quiz_title || assignment.study_set_title || "Mixed"}</td>
                    <td>{formatDate(assignment.deadline_at)}</td>
                    <td>
                      {user.role === "student" ? (
                        <AssignmentStatusBadge status={assignment.status} />
                      ) : (
                        <span className="text-muted small">
                          {assignment.completed_count}/{assignment.recipient_count} completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              title="No assignments yet"
              description={
                user.role === "student"
                  ? "Assignments will appear here after a teacher publishes work to you or your class."
                  : "Create your first assignment to start tracking completion."
              }
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default AssignmentsPage;
