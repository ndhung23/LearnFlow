import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import StudySetForm from "../components/StudySetForm";
import classService from "../services/classService";
import studySetService from "../services/studySetService";

function StudySetFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classes, setClasses] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const classList = await classService.list();
      setClasses(classList);

      if (mode === "edit" && id) {
        const studySet = await studySetService.getById(id);
        setInitialValues(studySet);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load form data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [id, mode]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...values,
        tags: values.tags,
        flashcards: values.flashcards,
      };

      const savedStudySet =
        mode === "edit" && id
          ? await studySetService.update(id, payload)
          : await studySetService.create(payload);

      navigate(`/study-sets/${savedStudySet.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save study set.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading study set form..." />;
  }

  if (error && !classes.length && !initialValues && mode === "edit") {
    return <ErrorState message={error} onRetry={loadPage} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={mode === "edit" ? "Edit Study Set" : "Create Study Set"}
        title={mode === "edit" ? "Refine the learning set" : "Build a new study set"}
        description="Keep terms concise, definitions clear, and hints practical so learners can move through modes quickly."
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <StudySetForm
        initialValues={initialValues}
        classes={classes}
        submitting={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default StudySetFormPage;
