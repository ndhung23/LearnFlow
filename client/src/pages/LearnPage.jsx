import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import FlashcardDeck from "../components/FlashcardDeck";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import studySetService from "../services/studySetService";

function LearnPage() {
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
      setError(requestError.response?.data?.message || "Unable to load learn mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudySet();
  }, [id]);

  const handleSaveProgress = async (payload) => {
    try {
      await studySetService.updateProgress(id, payload);
      setNotice("Progress saved.");
      await loadStudySet();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save your progress.");
    }
  };

  if (loading) {
    return <LoadingState label="Preparing learn mode..." />;
  }

  if (error && !studySet) {
    return <ErrorState message={error} onRetry={loadStudySet} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title={studySet.title}
        description="Flip through terms, decide what you know, and save progress as you go."
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <FlashcardDeck studySet={studySet} onSaveProgress={handleSaveProgress} />
    </div>
  );
}

export default LearnPage;
