import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import analyticsService from "../services/analyticsService";
import { formatDate } from "../utils/formatters";

function TeacherDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await analyticsService.teacherStats();
      setStats(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load teacher metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  if (loading) {
    return <LoadingState label="Loading teacher dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadPage} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Teacher"
        title="Teaching Pulse"
        description="Track classes, assignments, and performance without losing sight of the learners behind the numbers."
      />

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Classes"
            title="Live Classes"
            value={stats.total_classes}
            subtitle="Active classes you teach"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Content"
            title="Study Sets"
            value={stats.total_study_sets}
            subtitle="Sets published to support practice"
            accent="var(--lf-teal)"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Assignments"
            title="Total Assignments"
            value={stats.total_assignments}
            subtitle="Assigned across your classes"
            accent="var(--lf-gold)"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Scores"
            title="Average Score"
            value={`${stats.average_score}%`}
            subtitle="Based on completed recipients"
            accent="var(--lf-coral)"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={7}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Recent Assignments</div>
              <h2 className="h5 mb-4">What students are working on right now</h2>

              {stats.recentAssignments.length ? (
                <div className="d-grid gap-3">
                  {stats.recentAssignments.map((assignment) => (
                    <div key={assignment.id} className="activity-item">
                      <div className="d-flex justify-content-between gap-3">
                        <div>
                          <div className="fw-semibold">{assignment.title}</div>
                          <div className="small text-muted">
                            {assignment.class_title || "Direct assignment"} · due{" "}
                            {formatDate(assignment.deadline_at)}
                          </div>
                        </div>
                        <div className="text-end small text-muted">
                          {assignment.completed_count}/{assignment.recipient_count} completed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No assignments yet"
                  description="Create a study set or quiz, then assign it to a class from the assignments page."
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Class Performance</div>
              <h2 className="h5 mb-4">Average score by class</h2>

              {stats.classPerformance.length ? (
                <div className="d-grid gap-3">
                  {stats.classPerformance.map((classItem) => (
                    <div key={classItem.id} className="activity-item">
                      <div className="fw-semibold">{classItem.title}</div>
                      <div className="small text-muted">
                        {classItem.student_count} students · {classItem.average_score}% average
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No class data yet"
                  description="Performance insights will show up after students start completing assignments."
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default TeacherDashboardPage;
