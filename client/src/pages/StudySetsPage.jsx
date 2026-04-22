import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StudySetCard from "../components/StudySetCard";
import useAuth from "../hooks/useAuth";
import useDebounce from "../hooks/useDebounce";
import studySetService from "../services/studySetService";

function StudySetsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState({
    search: "",
    subject: "",
    visibility: "",
    sort: "latest",
  });
  const debouncedSearch = useDebounce(query.search, 350);
  const [result, setResult] = useState({ studySets: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudySets = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await studySetService.list({
        ...query,
        search: debouncedSearch,
        page: 1,
        pageSize: 12,
      });
      setResult(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load study sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudySets();
  }, [debouncedSearch, query.subject, query.visibility, query.sort]);

  const handleBookmark = async (studySet) => {
    try {
      if (studySet.is_bookmarked) {
        await studySetService.unbookmark(studySet.id);
      } else {
        await studySetService.bookmark(studySet.id);
      }
      await loadStudySets();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update bookmark.");
    }
  };

  const handleDuplicate = async (studySetId) => {
    try {
      await studySetService.duplicate(studySetId);
      await loadStudySets();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to duplicate study set.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Study Sets"
        title="Explore Learning Content"
        description="Search by title, filter by subject or visibility, and jump into the best mode for the task at hand."
        actions={
          user.role !== "student" ? (
            <Button as={Link} to="/study-sets/create" className="rounded-pill">
              Create Study Set
            </Button>
          ) : null
        }
      />

      <div className="surface-card mb-4">
        <Row className="g-3 align-items-end">
          <Col lg={5}>
            <Form.Label>Search</Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="Search study sets by title"
                value={query.search}
                onChange={(event) =>
                  setQuery((current) => ({ ...current, search: event.target.value }))
                }
              />
            </InputGroup>
          </Col>
          <Col md={4} lg={3}>
            <Form.Label>Subject</Form.Label>
            <Form.Control
              placeholder="Biology, History..."
              value={query.subject}
              onChange={(event) =>
                setQuery((current) => ({ ...current, subject: event.target.value }))
              }
            />
          </Col>
          <Col md={4} lg={2}>
            <Form.Label>Visibility</Form.Label>
            <Form.Select
              value={query.visibility}
              onChange={(event) =>
                setQuery((current) => ({ ...current, visibility: event.target.value }))
              }
            >
              <option value="">All</option>
              <option value="private">Private</option>
              <option value="class-only">Class Only</option>
              <option value="public">Public</option>
            </Form.Select>
          </Col>
          <Col md={4} lg={2}>
            <Form.Label>Sort</Form.Label>
            <Form.Select
              value={query.sort}
              onChange={(event) =>
                setQuery((current) => ({ ...current, sort: event.target.value }))
              }
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="title">Title</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {loading ? <LoadingState label="Loading study sets..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadStudySets} /> : null}

      {!loading && !error ? (
        result.studySets.length ? (
          <Row className="g-4">
            {result.studySets.map((studySet) => (
              <Col key={studySet.id} md={6} xl={4}>
                <StudySetCard
                  studySet={studySet}
                  action={
                    <div className="d-flex gap-2">
                      <Button
                        variant={studySet.is_bookmarked ? "dark" : "outline-dark"}
                        className="rounded-pill"
                        onClick={() => handleBookmark(studySet)}
                      >
                        {studySet.is_bookmarked ? "Saved" : "Save"}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="rounded-pill"
                        onClick={() => handleDuplicate(studySet.id)}
                      >
                        Copy
                      </Button>
                    </div>
                  }
                />
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState
            title="No study sets matched"
            description="Try widening your search or creating a new set."
          />
        )
      ) : null}
    </div>
  );
}

export default StudySetsPage;
