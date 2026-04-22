import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";

function NotFoundPage() {
  return (
    <div className="surface-card text-center py-5">
      <div className="eyebrow mb-2">404</div>
      <h1 className="h2 mb-3">This page wandered off.</h1>
      <p className="text-muted mb-4">
        The route you entered does not exist in this LearnFlow workspace.
      </p>
      <Button as={Link} to="/" className="rounded-pill px-4">
        Back to Home
      </Button>
    </div>
  );
}

export default NotFoundPage;
