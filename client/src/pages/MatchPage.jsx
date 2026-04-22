import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import MatchBoard from "../components/MatchBoard";
import PageHeader from "../components/PageHeader";
import studySetService from "../services/studySetService";

function MatchPage() {
  const { id } = useParams();
  const [studySet, setStudySet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStudySet = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await studySetService.getById(id);
      setStudySet(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load match mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudySet();
  }, [id]);

  const handleComplete = async (payload) => {
    try {
      await studySetService.updateProgress(id, payload);
      setNotice("Match session saved.");
      await loadStudySet();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save match session.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading match mode..." />;
  }

  if (error && !studySet) {
    return <ErrorState message={error} onRetry={loadStudySet} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Match"
        title={studySet.title}
        description="Quick pair-up practice for terms and definitions."
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <MatchBoard flashcards={studySet.flashcards} onComplete={handleComplete} />
    </div>
  );
}

export default MatchPage;
