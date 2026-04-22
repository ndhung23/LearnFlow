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
import { formatDateTime } from "../utils/formatters";

function StudentDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await analyticsService.studentStats();
      setStats(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  if (loading) {
    return <LoadingState label="Loading student dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadPage} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Student"
        title="Your Study Momentum"
        description="Keep your next assignment, recent progress, and latest scores visible in one place."
      />

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Assignments"
            title="Total Assigned"
            value={stats.total_assignments}
            subtitle="Current and completed work"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Done"
            title="Completed"
            value={stats.completed_assignments}
            subtitle={`${stats.completion_rate}% completion rate`}
            accent="var(--lf-teal)"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Scores"
            title="Average Score"
            value={`${stats.average_score}%`}
            subtitle="Across submitted assignments"
            accent="var(--lf-gold)"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Saved"
            title="Bookmarked Sets"
            value={stats.bookmarked_sets}
            subtitle="Ready for quick review"
            accent="var(--lf-coral)"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={6}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Recent Progress</div>
              <h2 className="h5 mb-4">Study sets you touched recently</h2>

              {stats.recentProgress.length ? (
                <div className="d-grid gap-3">
                  {stats.recentProgress.map((item) => (
                    <div key={item.study_set_id} className="activity-item">
                      <div className="fw-semibold">{item.title}</div>
                      <div className="small text-muted">
                        {item.subject} · {item.completion_rate}% complete · last studied{" "}
                        {formatDateTime(item.last_studied_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No progress yet"
                  description="Open a study set in learn mode to start tracking your recall."
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Recent Scores</div>
              <h2 className="h5 mb-4">Your latest quiz and test runs</h2>

              {stats.recentSubmissions.length ? (
                <div className="d-grid gap-3">
                  {stats.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="activity-item">
                      <div className="fw-semibold">
                        {submission.quiz_title || submission.study_set_title}
                      </div>
                      <div className="small text-muted">
                        {submission.mode} · {submission.score}% · {formatDateTime(submission.submitted_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No submissions yet"
                  description="Quiz and test attempts will show up here after your first run."
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StudentDashboardPage;
