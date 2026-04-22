import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import PageHeader from "../components/PageHeader";
import useAuth from "../hooks/useAuth";
import { formatDateTime, formatRole } from "../utils/formatters";

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title={user.full_name}
        description="Your LearnFlow account details and role summary."
      />

      <Row className="g-4">
        <Col lg={4}>
          <Card className="surface-card border-0">
            <Card.Body>
              <div className="profile-avatar mb-3">
                {user.full_name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h2 className="h4">{user.full_name}</h2>
              <div className="text-muted mb-3">{user.email}</div>
              <div className="tag-pill d-inline-flex">{formatRole(user.role)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="surface-card border-0">
            <Card.Body>
              <h3 className="h5 mb-4">Account Snapshot</h3>
              <Row className="g-3">
                <Col md={6}>
                  <div className="text-muted small">Role</div>
                  <div className="fw-semibold">{formatRole(user.role)}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">Last Login</div>
                  <div className="fw-semibold">{formatDateTime(user.last_login_at)}</div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted small">Bio</div>
                  <div className="fw-semibold">{user.bio || "No bio added yet."}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProfilePage;
