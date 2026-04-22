import Spinner from "react-bootstrap/Spinner";

function LoadingState({ label = "Loading..." }) {
  return (
    <div className="surface-card d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation="border" role="status" />
      <span className="mt-3 text-muted">{label}</span>
    </div>
  );
}

export default LoadingState;
