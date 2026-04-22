import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import classService from "../services/classService";
import { formatDate, formatDateTime } from "../utils/formatters";

function ClassDetailPage() {
  const { id } = useParams();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClass = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await classService.getById(id);
      setClassDetail(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load class details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClass();
  }, [id]);

  if (loading) {
    return <LoadingState label="Loading class details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadClass} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={classDetail.subject || "Class"}
        title={classDetail.title}
        description={classDetail.description || "Use this space to track students, content, and assignment completion."}
        actions={
          <Button as={Link} to="/assignments" className="rounded-pill">
            Open Assignments
          </Button>
        }
      />

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Teacher</div>
              <div className="fw-semibold">{classDetail.teacher_name}</div>
              <div className="text-muted small">{classDetail.teacher_email}</div>
              <hr />
              <div className="small text-muted">Code: {classDetail.code}</div>
              <div className="small text-muted">Created: {formatDate(classDetail.created_at)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Study Sets</div>
              <div className="display-6 fw-bold">{classDetail.studySets.length}</div>
              <div className="text-muted small">Class-linked learning collections</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Students</div>
              <div className="display-6 fw-bold">{classDetail.students.length}</div>
              <div className="text-muted small">Active class membership count</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={7}>
          <Card className="surface-card border-0 mb-4">
            <Card.Body>
              <div className="eyebrow mb-1">Students</div>
              <h2 className="h5 mb-4">Roster and average assignment score</h2>
              {classDetail.students.length ? (
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classDetail.students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.full_name}</td>
                        <td>{student.email}</td>
                        <td>{formatDateTime(student.joined_at)}</td>
                        <td>{student.average_score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <EmptyState
                  title="No students in this class"
                  description="Students will appear here after they join using the class ID."
                />
              )}
            </Card.Body>
          </Card>

          <Card className="surface-card border-0">
            <Card.Body>
              <div className="eyebrow mb-1">Assignments</div>
              <h2 className="h5 mb-4">Assignment rollout</h2>
              {classDetail.assignments.length ? (
                <div className="d-grid gap-3">
                  {classDetail.assignments.map((assignment) => (
                    <div key={assignment.id} className="activity-item">
                      <div className="fw-semibold">{assignment.title}</div>
                      <div className="small text-muted">
                        Due {formatDate(assignment.deadline_at)} · {assignment.completed_count}/
                        {assignment.recipient_count} completed
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No assignments yet"
                  description="Create assignments to add deadlines and recipient tracking."
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="surface-card border-0 mb-4">
            <Card.Body>
              <div className="eyebrow mb-1">Study Sets</div>
              <h2 className="h5 mb-4">Content linked to this class</h2>
              {classDetail.studySets.length ? (
                <div className="d-grid gap-3">
                  {classDetail.studySets.map((studySet) => (
                    <div key={studySet.id} className="activity-item">
                      <div className="fw-semibold">{studySet.title}</div>
                      <div className="small text-muted">
                        {studySet.subject} · {studySet.flashcard_count} cards
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No class study sets yet"
                  description="Attach a set to this class for class-only access."
                />
              )}
            </Card.Body>
          </Card>

          <Card className="surface-card border-0">
            <Card.Body>
              <div className="eyebrow mb-1">Leaderboard</div>
              <h2 className="h5 mb-4">Top learners by average score</h2>
              {classDetail.leaderboard.length ? (
                <div className="d-grid gap-3">
                  {classDetail.leaderboard.map((entry, index) => (
                    <div key={entry.id} className="activity-item">
                      <div className="fw-semibold">
                        #{index + 1} {entry.full_name}
                      </div>
                      <div className="small text-muted">
                        {entry.average_score}% average · {entry.completed_assignments} completed
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Leaderboard coming soon"
                  description="Scores will show up after assignment submissions are completed."
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ClassDetailPage;
