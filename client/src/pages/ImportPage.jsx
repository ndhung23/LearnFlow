import { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";
import Tabs from "react-bootstrap/Tabs";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import classService from "../services/classService";
import importService from "../services/importService";
import { formatDateTime } from "../utils/formatters";

const initialMeta = {
  title: "",
  description: "",
  subject: "",
  visibility: "private",
  classId: "",
  tags: "",
};

function ImportPage() {
  const [activeTab, setActiveTab] = useState("text");
  const [meta, setMeta] = useState(initialMeta);
  const [textContent, setTextContent] = useState("term | definition\nNucleus | Stores DNA and directs cell activities");
  const [csvFile, setCsvFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const canSave = useMemo(() => Boolean(meta.title), [meta.title]);

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const [classList, importJobs] = await Promise.all([
        classService.list(),
        importService.listJobs(),
      ]);
      setClasses(classList);
      setJobs(importJobs);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load import tools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const buildSharedPayload = (isPreview) => ({
    ...meta,
    classId: meta.classId || null,
    preview: isPreview,
  });

  const handlePreview = async () => {
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      let response;

      if (activeTab === "text") {
        response = await importService.importText({
          ...buildSharedPayload(true),
          content: textContent,
        });
      } else {
        const formData = new FormData();
        formData.append("file", csvFile);
        Object.entries(buildSharedPayload(true)).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        formData.append("preview", "true");
        response = await importService.importCsv(formData);
      }

      setPreview(response.preview);
      await loadPage();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to preview import.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      let response;

      if (activeTab === "text") {
        response = await importService.importText({
          ...buildSharedPayload(false),
          content: textContent,
        });
      } else {
        const formData = new FormData();
        formData.append("file", csvFile);
        Object.entries(buildSharedPayload(false)).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        response = await importService.importCsv(formData);
      }

      setPreview(response.preview);
      setNotice(`Imported into study set "${response.studySet.title}".`);
      setMeta(initialMeta);
      setCsvFile(null);
      await loadPage();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save import.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading import workspace..." />;
  }

  if (error && !jobs.length) {
    return <ErrorState message={error} onRetry={loadPage} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Import"
        title="Bring content in fast"
        description="Paste text, upload CSV, or send JSON, preview the cards, then publish to a new study set."
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Row className="g-4">
        <Col xl={7}>
          <Card className="surface-card border-0">
            <Card.Body>
              <div className="eyebrow mb-1">Import Source</div>
              <h2 className="h5 mb-4">Prepare cards before publishing</h2>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Control
                    placeholder="Study set title"
                    value={meta.title}
                    onChange={(event) =>
                      setMeta((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    placeholder="Subject"
                    value={meta.subject}
                    onChange={(event) =>
                      setMeta((current) => ({ ...current, subject: event.target.value }))
                    }
                  />
                </Col>
                <Col xs={12}>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Description"
                    value={meta.description}
                    onChange={(event) =>
                      setMeta((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={meta.visibility}
                    onChange={(event) =>
                      setMeta((current) => ({ ...current, visibility: event.target.value }))
                    }
                  >
                    <option value="private">Private</option>
                    <option value="class-only">Class Only</option>
                    <option value="public">Public</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={meta.classId}
                    onChange={(event) =>
                      setMeta((current) => ({ ...current, classId: event.target.value }))
                    }
                  >
                    <option value="">No class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.title}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Control
                    placeholder="Tags"
                    value={meta.tags}
                    onChange={(event) =>
                      setMeta((current) => ({ ...current, tags: event.target.value }))
                    }
                  />
                </Col>
              </Row>

              <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || "text")} className="mb-3">
                <Tab eventKey="text" title="Paste Text">
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={textContent}
                    onChange={(event) => setTextContent(event.target.value)}
                  />
                </Tab>
                <Tab eventKey="csv" title="CSV Upload">
                  <Form.Group>
                    <Form.Label>Upload CSV file</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                    />
                  </Form.Group>
                </Tab>
              </Tabs>

              <div className="d-flex flex-wrap gap-2">
                <Button onClick={handlePreview} disabled={submitting || (activeTab === "csv" && !csvFile)}>
                  {submitting ? "Working..." : "Preview Import"}
                </Button>
                <Button
                  variant="outline-dark"
                  onClick={handleSave}
                  disabled={!canSave || submitting || (activeTab === "csv" && !csvFile)}
                >
                  Save as Study Set
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="surface-card border-0 mt-4">
            <Card.Body>
              <div className="eyebrow mb-1">Preview</div>
              <h2 className="h5 mb-4">Validate before saving</h2>

              {preview ? (
                <>
                  <div className="text-muted small mb-3">
                    {preview.validRows} valid rows · {preview.invalidRows} invalid rows
                  </div>
                  <Table responsive hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Term</th>
                        <th>Definition</th>
                        <th>Difficulty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.cards.slice(0, 8).map((card, index) => (
                        <tr key={`${card.term}-${index}`}>
                          <td>{card.term}</td>
                          <td>{card.definition}</td>
                          <td>{card.difficulty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <EmptyState
                  title="No preview yet"
                  description="Preview your import to validate rows and see what will be saved."
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="surface-card border-0">
            <Card.Body>
              <div className="eyebrow mb-1">Import Log</div>
              <h2 className="h5 mb-4">Recent preview and import jobs</h2>

              {jobs.length ? (
                <div className="d-grid gap-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="activity-item">
                      <div className="fw-semibold">
                        {job.filename || job.study_set_title || "Manual import"}
                      </div>
                      <div className="small text-muted">
                        {job.source_type} · {job.status} · {job.success_rows}/{job.total_rows} rows ·{" "}
                        {formatDateTime(job.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No import jobs yet"
                  description="Preview or save an import to start building your content log."
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ImportPage;
