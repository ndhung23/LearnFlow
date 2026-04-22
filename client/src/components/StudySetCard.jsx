import { Link } from "react-router-dom";
import Badge from "react-bootstrap/Badge";

function StudySetCard({ studySet, action }) {
  return (
    <div className="surface-card h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <Badge bg="light" text="dark" className="text-uppercase fw-semibold mb-2">
            {studySet.subject || "General"}
          </Badge>
          <h3 className="h5 mb-1">
            <Link to={`/study-sets/${studySet.id}`} className="text-decoration-none link-dark">
              {studySet.title}
            </Link>
          </h3>
          <div className="text-muted small">By {studySet.owner_name}</div>
        </div>
        <Badge bg="dark">{studySet.visibility}</Badge>
      </div>

      <p className="text-muted flex-grow-1">{studySet.description || "No description yet."}</p>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {(studySet.tags || []).slice(0, 4).map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center text-muted small">
        <span>{studySet.flashcard_count} cards</span>
        <span>{studySet.quiz_count} quizzes</span>
        <span>{studySet.bookmark_count} saves</span>
      </div>

      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export default StudySetCard;
