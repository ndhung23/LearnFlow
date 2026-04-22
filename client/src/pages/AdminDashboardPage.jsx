import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import analyticsService from "../services/analyticsService";
import userService from "../services/userService";
import { formatDateTime, formatRole } from "../utils/formatters";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  role: "teacher",
};

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState(initialForm);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, usersResponse] = await Promise.all([
        analyticsService.adminStats(),
        userService.list({ page: 1, pageSize: 20 }),
      ]);

      setStats(statsResponse);
      setUsers(usersResponse.users);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const resetForm = () => {
    setEditingUser(null);
    setFormValues(initialForm);
    setFormError("");
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormValues({
      fullName: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.is_active,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      if (editingUser) {
        await userService.update(editingUser.id, formValues);
      } else {
        await userService.create(formValues);
      }

      resetForm();
      await loadPage();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Unable to save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await userService.remove(userId);
      await loadPage();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to deactivate user.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadPage} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="System Overview"
        description="Manage users, keep an eye on platform health, and monitor recent activity."
      />

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Users"
            title="Active Accounts"
            value={stats.total_users}
            subtitle="Students, teachers, and admins"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Content"
            title="Study Sets"
            value={stats.total_study_sets}
            subtitle="Published learning collections"
            accent="var(--lf-teal)"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Attempts"
            title="Quiz Submissions"
            value={stats.total_quiz_attempts}
            subtitle="Tracked quiz and test runs"
            accent="var(--lf-gold)"
          />
        </Col>
        <Col md={6} xl={3}>
          <MetricCard
            eyebrow="Completion"
            title="Assignment Finish Rate"
            value={`${stats.completion_rate}%`}
            subtitle="Across all assignment recipients"
            accent="var(--lf-coral)"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={4}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="eyebrow mb-1">User Management</div>
                  <h2 className="h5 mb-0">{editingUser ? "Edit User" : "Create User"}</h2>
                </div>
                {editingUser ? (
                  <Button variant="link" className="p-0 text-decoration-none" onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
              </div>

              {formError ? <Alert variant="danger">{formError}</Alert> : null}

              <Form className="d-grid gap-3" onSubmit={handleSubmit}>
                <Form.Control
                  placeholder="Full name"
                  value={formValues.fullName}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, fullName: event.target.value }))
                  }
                />
                <Form.Control
                  placeholder="Email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, email: event.target.value }))
                  }
                />
                <Form.Control
                  placeholder={editingUser ? "New password (optional)" : "Password"}
                  type="password"
                  value={formValues.password}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, password: event.target.value }))
                  }
                />
                <Form.Select
                  value={formValues.role}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, role: event.target.value }))
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </Form.Select>

                {editingUser ? (
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label="Active account"
                    checked={formValues.isActive !== false}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, isActive: event.target.checked }))
                    }
                  />
                ) : null}

                <Button type="submit" disabled={saving} className="rounded-pill">
                  {saving ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={8}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="eyebrow mb-1">Users</div>
                  <h2 className="h5 mb-0">People in the system</h2>
                </div>
                <div className="text-muted small">{users.length} loaded</div>
              </div>

              {users.length ? (
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="fw-semibold">{user.full_name}</div>
                          <div className="small text-muted">{user.email}</div>
                        </td>
                        <td>{formatRole(user.role)}</td>
                        <td>{user.is_active ? "Active" : "Disabled"}</td>
                        <td>{formatDateTime(user.last_login_at)}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              size="sm"
                              variant="outline-dark"
                              className="rounded-pill"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="rounded-pill"
                              onClick={() => handleDeactivate(user.id)}
                            >
                              Disable
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <EmptyState
                  title="No users found"
                  description="Create the first user from the panel on the left."
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-1">
        <Col lg={6}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Recent Activity</div>
              <h2 className="h5 mb-4">Latest platform events</h2>
              <div className="d-grid gap-3">
                {stats.recentActivity.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className="fw-semibold">
                      {item.full_name} · {item.activity_type}
                    </div>
                    <div className="small text-muted">{formatDateTime(item.created_at)}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="surface-card border-0 h-100">
            <Card.Body>
              <div className="eyebrow mb-1">Recent Users</div>
              <h2 className="h5 mb-4">Most recently active accounts</h2>
              <div className="d-grid gap-3">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="activity-item">
                    <div className="fw-semibold">
                      {user.full_name} · {formatRole(user.role)}
                    </div>
                    <div className="small text-muted">{formatDateTime(user.last_login_at)}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboardPage;
