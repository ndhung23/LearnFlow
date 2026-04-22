import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { DIFFICULTY_OPTIONS, STUDY_VISIBILITY_OPTIONS } from "../utils/constants";

function createEmptyFlashcard(index = 1) {
  return {
    sortOrder: index,
    term: "",
    definition: "",
    example: "",
    hint: "",
    difficulty: "medium",
  };
}

function StudySetForm({ initialValues, classes, submitting, onSubmit }) {
  const [formValues, setFormValues] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    subject: initialValues?.subject || "",
    tags: (initialValues?.tags || []).join(", "),
    visibility: initialValues?.visibility || "private",
    classId: initialValues?.class_id || "",
    estimatedMinutes: initialValues?.estimated_minutes || 10,
    flashcards:
      initialValues?.flashcards?.length
        ? initialValues.flashcards.map((card, index) => ({
            sortOrder: card.sort_order || index + 1,
            term: card.term || "",
            definition: card.definition || "",
            example: card.example || "",
            hint: card.hint || "",
            difficulty: card.difficulty || "medium",
          }))
        : [createEmptyFlashcard(1), createEmptyFlashcard(2)],
  });

  const updateFlashcard = (index, key, value) => {
    setFormValues((current) => ({
      ...current,
      flashcards: current.flashcards.map((flashcard, flashcardIndex) =>
        flashcardIndex === index
          ? {
              ...flashcard,
              [key]: value,
            }
          : flashcard
      ),
    }));
  };

  const addFlashcard = () => {
    setFormValues((current) => ({
      ...current,
      flashcards: [...current.flashcards, createEmptyFlashcard(current.flashcards.length + 1)],
    }));
  };

  const removeFlashcard = (index) => {
    setFormValues((current) => ({
      ...current,
      flashcards: current.flashcards
        .filter((_, flashcardIndex) => flashcardIndex !== index)
        .map((flashcard, nextIndex) => ({
          ...flashcard,
          sortOrder: nextIndex + 1,
        })),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formValues,
      classId: formValues.classId || null,
    });
  };

  return (
    <Form className="surface-card" onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={formValues.title}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Ex: Cell Structure Fundamentals"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Subject</Form.Label>
            <Form.Control
              value={formValues.subject}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, subject: event.target.value }))
              }
              placeholder="Biology"
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formValues.description}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What should learners focus on?"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Visibility</Form.Label>
            <Form.Select
              value={formValues.visibility}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, visibility: event.target.value }))
              }
            >
              {STUDY_VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Class</Form.Label>
            <Form.Select
              value={formValues.classId}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, classId: event.target.value }))
              }
            >
              <option value="">No class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Estimated Minutes</Form.Label>
            <Form.Control
              type="number"
              min="5"
              value={formValues.estimatedMinutes}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  estimatedMinutes: Number(event.target.value),
                }))
              }
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <Form.Label>Tags</Form.Label>
            <Form.Control
              value={formValues.tags}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder="biology, cells, exam-prep"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <div>
          <div className="eyebrow mb-1">Flashcards</div>
          <h3 className="h5 mb-0">Add terms learners will review</h3>
        </div>
        <Button type="button" variant="outline-dark" className="rounded-pill" onClick={addFlashcard}>
          Add Flashcard
        </Button>
      </div>

      <div className="d-grid gap-3">
        {formValues.flashcards.map((flashcard, index) => (
          <div key={`${index}-${flashcard.sortOrder}`} className="flashcard-editor">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong>Card {index + 1}</strong>
              {formValues.flashcards.length > 1 ? (
                <Button
                  type="button"
                  variant="link"
                  className="text-danger text-decoration-none p-0"
                  onClick={() => removeFlashcard(index)}
                >
                  Remove
                </Button>
              ) : null}
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Control
                  value={flashcard.term}
                  onChange={(event) => updateFlashcard(index, "term", event.target.value)}
                  placeholder="Term"
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  value={flashcard.definition}
                  onChange={(event) => updateFlashcard(index, "definition", event.target.value)}
                  placeholder="Definition"
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  value={flashcard.example}
                  onChange={(event) => updateFlashcard(index, "example", event.target.value)}
                  placeholder="Optional example"
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  value={flashcard.hint}
                  onChange={(event) => updateFlashcard(index, "hint", event.target.value)}
                  placeholder="Optional hint"
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={flashcard.difficulty}
                  onChange={(event) => updateFlashcard(index, "difficulty", event.target.value)}
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" disabled={submitting} className="rounded-pill px-4">
          {submitting ? "Saving..." : "Save Study Set"}
        </Button>
      </div>
    </Form>
  );
}

export default StudySetForm;
