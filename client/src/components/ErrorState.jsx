import Alert from "react-bootstrap/Alert";

function ErrorState({ message, onRetry }) {
  return (
    <Alert variant="danger" className="surface-card border-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <Alert.Heading className="h6 mb-1">Something went wrong</Alert.Heading>
          <div>{message}</div>
        </div>
        {onRetry ? (
          <button type="button" className="btn btn-outline-danger" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    </Alert>
  );
}

export default ErrorState;
