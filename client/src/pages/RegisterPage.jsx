import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import useAuth from "../hooks/useAuth";
import useLanguage from "../hooks/useLanguage";
import getApiErrorMessage from "../utils/getApiErrorMessage";

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
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
      await register(formValues);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, t("register.fallbackError")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="eyebrow mb-2">{t("register.eyebrow")}</div>
      <h2 className="h3 mb-3">{t("register.title")}</h2>
      <p className="text-muted mb-4">{t("register.description")}</p>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t("register.fullName")}</Form.Label>
          <Form.Control
            value={formValues.fullName}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, fullName: event.target.value }))
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("register.email")}</Form.Label>
          <Form.Control
            type="email"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, email: event.target.value }))
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("register.password")}</Form.Label>
          <Form.Control
            type="password"
            value={formValues.password}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, password: event.target.value }))
            }
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>{t("register.role")}</Form.Label>
          <Form.Select
            value={formValues.role}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, role: event.target.value }))
            }
          >
            <option value="student">{t("register.student")}</option>
            <option value="teacher">{t("register.teacher")}</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" disabled={submitting} className="w-100 rounded-pill py-2">
          {submitting ? t("register.submitting") : t("register.submit")}
        </Button>
      </Form>

      <div className="text-muted mt-4 text-center">
        {t("register.footer")} <Link to="/login">{t("register.footerLink")}</Link>
      </div>
    </div>
  );
}

export default RegisterPage;
