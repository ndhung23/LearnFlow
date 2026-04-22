import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import useAuth from "../hooks/useAuth";
import useLanguage from "../hooks/useLanguage";
import getApiErrorMessage from "../utils/getApiErrorMessage";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    email: "admin@learnflow.app",
    password: "Password123!",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(formValues);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, t("login.fallbackError")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="eyebrow mb-2">{t("login.eyebrow")}</div>
      <h2 className="h3 mb-3">{t("login.title")}</h2>
      <p className="text-muted mb-4">{t("login.description")}</p>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t("login.email")}</Form.Label>
          <Form.Control
            type="email"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, email: event.target.value }))
            }
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>{t("login.password")}</Form.Label>
          <Form.Control
            type="password"
            value={formValues.password}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, password: event.target.value }))
            }
          />
        </Form.Group>

        <Button type="submit" disabled={submitting} className="w-100 rounded-pill py-2">
          {submitting ? t("login.submitting") : t("login.submit")}
        </Button>
      </Form>

      <div className="text-muted mt-4 text-center">
        {t("login.footer")} <Link to="/register">{t("login.footerLink")}</Link>
      </div>
    </div>
  );
}

export default LoginPage;
